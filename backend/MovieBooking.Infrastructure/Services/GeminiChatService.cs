using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using MovieBooking.Application.DTOs.Chat;
using MovieBooking.Application.Interfaces;
using MovieBooking.Infrastructure.Data;
using System.Net.Http.Json;
using System.Text.Json;

namespace MovieBooking.Infrastructure.Services
{
    public class GeminiChatService : IChatService
    {
        private readonly IConfiguration _config;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly MovieTools _tools;

        private static readonly JsonSerializerOptions _jsonOpts = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        public GeminiChatService(
            IConfiguration config,
            IHttpClientFactory httpClientFactory,
            MovieBookingDbContext context)
        {
            _config = config;
            _httpClientFactory = httpClientFactory;
            _tools = new MovieTools(context);
        }

        public async Task<ChatResponseDto> SendMessageAsync(ChatRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
                return new ChatResponseDto { Success = false, Error = "Tin nhắn không được để trống" };

            var ai = _config.GetSection("AiSettings");
            string apiKey   = ai["ApiKey"]!;
            string endpoint = ai["Endpoint"]!;
            string url      = $"{endpoint}?key={apiKey}";

            string systemPrompt =
                "Bạn là trợ lý AI thân thiện của rạp chiếu phim TTA Movie. " +
                "Bạn CHỈ được phép trả lời các câu hỏi liên quan đến:\n" +
                "- Phim đang chiếu, sắp chiếu tại TTA Movie\n" +
                "- Lịch chiếu, giờ chiếu, phòng chiếu\n" +
                "- Giá vé, loại ghế (Thường, VIP, Đôi)\n" +
                "- Thông tin rạp, địa chỉ, hotline\n" +
                "- Hướng dẫn đặt vé, thanh toán (VNPay, chuyển khoản)\n" +
                "- Khuyến mãi, mã giảm giá\n" +
                "- Chính sách hủy vé, đổi vé\n\n" +
                "QUY TẮC BẮT BUỘC:\n" +
                "1. Nếu câu hỏi KHÔNG liên quan đến rạp phim TTA Movie, hãy từ chối lịch sự và nhắc người dùng hỏi về dịch vụ của rạp.\n" +
                "2. KHÔNG trả lời các câu hỏi về: chính trị, tôn giáo, y tế, pháp luật, tài chính cá nhân, lập trình, hay bất kỳ chủ đề nào ngoài phạm vi rạp phim.\n" +
                "3. KHÔNG bịa đặt thông tin — nếu cần dữ liệu thực tế hãy gọi đúng hàm được cung cấp.\n" +
                "4. Luôn trả lời bằng tiếng Việt, ngắn gọn, thân thiện.\n" +
                "5. Nếu không chắc thông tin, hãy nói thật và gợi ý khách liên hệ hotline rạp.";

            // Xây dựng contents từ lịch sử + tin nhắn mới
            var contents = BuildContents(request);

            var client = _httpClientFactory.CreateClient("Gemini");

            // ── Vòng lặp Function Calling ──────────────────────────────────
            // Tối đa 5 vòng để tránh loop vô hạn
            for (int round = 0; round < 5; round++)
            {
                var body = new
                {
                    system_instruction = new { parts = new[] { new { text = systemPrompt } } },
                    contents,
                    tools = MovieTools.GetToolDeclarations(),
                    generationConfig = new
                    {
                        temperature      = 0.7,
                        maxOutputTokens  = 1024,
                        topP             = 0.9,
                    }
                };

                HttpResponseMessage httpResp;
                try
                {
                    httpResp = await client.PostAsJsonAsync(url, body, _jsonOpts);
                }
                catch (Exception ex)
                {
                    return new ChatResponseDto { Success = false, Error = $"Không thể kết nối AI: {ex.Message}" };
                }

                if (!httpResp.IsSuccessStatusCode)
                {
                    var errBody = await httpResp.Content.ReadAsStringAsync();
                    return new ChatResponseDto { Success = false, Error = $"Gemini lỗi {(int)httpResp.StatusCode}: {errBody}" };
                }

                var json = await httpResp.Content.ReadFromJsonAsync<JsonElement>();
                var candidate = json.GetProperty("candidates")[0];
                var contentNode = candidate.GetProperty("content");

                // Kiểm tra AI có muốn gọi hàm không
                var functionCalls = ExtractFunctionCalls(contentNode);

                if (functionCalls.Count == 0)
                {
                    // Không có function call → AI đã có câu trả lời cuối
                    var reply = ExtractText(contentNode)
                                ?? "Xin lỗi, tôi không thể trả lời lúc này.";
                    return new ChatResponseDto { Success = true, Reply = reply };
                }

                // Thêm model turn (chứa functionCall) vào contents
                contents.Add(BuildModelTurn(contentNode));

                // Thực thi từng hàm và thu thập kết quả
                var toolResults = new List<object>();
                foreach (var (funcName, funcArgs) in functionCalls)
                {
                    string toolResult = await _tools.ExecuteAsync(funcName, funcArgs);
                    toolResults.Add(new
                    {
                        functionResponse = new
                        {
                            name     = funcName,
                            response = new { result = toolResult }
                        }
                    });
                }

                // Thêm tool response turn vào contents
                contents.Add(new { role = "user", parts = toolResults });
            }

            return new ChatResponseDto { Success = false, Error = "Vòng lặp function calling vượt giới hạn." };
        }

        // ── Helpers ──────────────────────────────────────────────────────────

        private static List<object> BuildContents(ChatRequestDto request)
        {
            var contents = new List<object>();
            foreach (var item in request.History.TakeLast(10))
            {
                contents.Add(new
                {
                    role  = item.Role,
                    parts = new[] { new { text = item.Content } }
                });
            }
            contents.Add(new
            {
                role  = "user",
                parts = new[] { new { text = request.Message } }
            });
            return contents;
        }

        /// <summary>Trích xuất tất cả functionCall từ model response</summary>
        private static List<(string Name, Dictionary<string, string> Args)> ExtractFunctionCalls(JsonElement contentNode)
        {
            var result = new List<(string, Dictionary<string, string>)>();
            if (!contentNode.TryGetProperty("parts", out var parts)) return result;

            foreach (var part in parts.EnumerateArray())
            {
                if (!part.TryGetProperty("functionCall", out var fc)) continue;

                string name = fc.GetProperty("name").GetString() ?? "";
                var args = new Dictionary<string, string>();

                if (fc.TryGetProperty("args", out var argsNode))
                {
                    foreach (var prop in argsNode.EnumerateObject())
                        args[prop.Name] = prop.Value.ToString();
                }

                result.Add((name, args));
            }
            return result;
        }

        /// <summary>Trích xuất text từ model response (khi không có function call)</summary>
        private static string? ExtractText(JsonElement contentNode)
        {
            if (!contentNode.TryGetProperty("parts", out var parts)) return null;
            foreach (var part in parts.EnumerateArray())
            {
                if (part.TryGetProperty("text", out var textProp))
                    return textProp.GetString();
            }
            return null;
        }

        /// <summary>Serialize lại model turn để đưa vào contents cho vòng tiếp theo</summary>
        private static object BuildModelTurn(JsonElement contentNode)
        {
            // Rebuild parts list từ JsonElement
            var parts = new List<object>();
            if (contentNode.TryGetProperty("parts", out var partsNode))
            {
                foreach (var part in partsNode.EnumerateArray())
                {
                    if (part.TryGetProperty("functionCall", out var fc))
                    {
                        var args = new Dictionary<string, object>();
                        if (fc.TryGetProperty("args", out var argsNode))
                        {
                            foreach (var prop in argsNode.EnumerateObject())
                                args[prop.Name] = prop.Value.ToString()!;
                        }
                        parts.Add(new
                        {
                            functionCall = new
                            {
                                name = fc.GetProperty("name").GetString(),
                                args
                            }
                        });
                    }
                    else if (part.TryGetProperty("text", out var textProp))
                    {
                        parts.Add(new { text = textProp.GetString() });
                    }
                }
            }
            return new { role = "model", parts };
        }
    }
}

using Microsoft.AspNetCore.Mvc;
using MovieBooking.Application.DTOs.Chat;
using MovieBooking.Application.Interfaces;

namespace MovieBooking.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;

        public ChatController(IChatService chatService)
        {
            _chatService = chatService;
        }

        /// <summary>
        /// POST /api/chat
        /// Gửi tin nhắn tới AI chatbot
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Chat([FromBody] ChatRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
                return BadRequest(new { message = "Tin nhắn không được để trống" });

            var result = await _chatService.SendMessageAsync(request);

            if (!result.Success)
                return StatusCode(502, new { message = result.Error });

            return Ok(result);
        }
    }
}

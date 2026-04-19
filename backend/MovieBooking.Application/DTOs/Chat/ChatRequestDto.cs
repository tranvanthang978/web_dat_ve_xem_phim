namespace MovieBooking.Application.DTOs.Chat
{
    public class ChatRequestDto
    {
        /// <summary>Tin nhắn người dùng gửi lên</summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>Lịch sử hội thoại (tuỳ chọn, để duy trì context)</summary>
        public List<ChatHistoryItem> History { get; set; } = new();
    }

    public class ChatHistoryItem
    {
        /// <summary>user | model</summary>
        public string Role { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }
}

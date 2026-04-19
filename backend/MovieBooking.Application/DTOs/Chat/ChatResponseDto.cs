namespace MovieBooking.Application.DTOs.Chat
{
    public class ChatResponseDto
    {
        public string Reply { get; set; } = string.Empty;
        public bool Success { get; set; }
        public string? Error { get; set; }
    }
}

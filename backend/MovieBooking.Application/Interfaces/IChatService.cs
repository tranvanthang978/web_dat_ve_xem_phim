using MovieBooking.Application.DTOs.Chat;

namespace MovieBooking.Application.Interfaces
{
    public interface IChatService
    {
        Task<ChatResponseDto> SendMessageAsync(ChatRequestDto request);
    }
}

using MovieBooking.Application.DTOs.Booking;

namespace MovieBooking.Application.Interfaces
{
    public interface IBookingService
    {
        Task<(bool Success, string Message, BookingResponseDto? Booking)> CreateBookingAsync(BookingRequestDto bookingRequest);
        Task<IEnumerable<BookingResponseDto>> GetBookingsByUserIdAsync(int userId);
        Task<IEnumerable<BookingResponseDto>> GetAllBookingsAsync();
        Task<BookingResponseDto?> GetBookingByIdAsync(int id);
        Task<bool> CancelBookingAsync(int id);
        Task<(bool Success, string Message)> UpdateBookingStatusAsync(int id, string newStatus);
    }
}

using MovieBooking.Application.DTOs.Movie;

namespace MovieBooking.Application.Interfaces
{
    public interface IPhimService
    {
        Task<IEnumerable<PhimDto>> GetAllPhimsAsync();
        Task<PhimDto?> GetPhimByIdAsync(int id);
        Task<IEnumerable<PhimDto>> GetPhimsDangChieuAsync();
        Task<PhimDto> CreatePhimAsync(CreatePhimDto createPhimDto);
        Task<bool> UpdatePhimAsync(int id, CreatePhimDto updatePhimDto);
        Task<(bool Success, string Message)> DeletePhimAsync(int id);
    }
}

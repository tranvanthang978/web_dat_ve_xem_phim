using MovieBooking.Application.DTOs.Cinema;
using MovieBooking.Application.DTOs.Showtime;

namespace MovieBooking.Application.Interfaces
{
    public interface ILichChieuService
    {
        Task<IEnumerable<LichChieuDto>> GetLichChieuByPhimIdAsync(int phimId);
        Task<IEnumerable<LichChieuDto>> GetLichChieuByPhongChieuIdAsync(int phongChieuId);
        Task<IEnumerable<LichChieuDto>> GetLichChieuByRapIdAsync(int rapId);
        Task<LichChieuDto?> GetLichChieuByIdAsync(int id);
        Task<IEnumerable<GheDto>> GetGhesByLichChieuIdAsync(int lichChieuId);
        Task<LichChieuDto> CreateLichChieuAsync(CreateLichChieuDto createLichChieuDto);
        Task<LichChieuDto?> UpdateLichChieuAsync(int id, CreateLichChieuDto dto);
        Task<(bool Success, string Message)> DeleteLichChieuAsync(int id);
    }
}

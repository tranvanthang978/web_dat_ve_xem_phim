using MovieBooking.Application.DTOs.Cinema;

namespace MovieBooking.Application.Interfaces
{
    public interface IRapService
    {
        Task<IEnumerable<RapDto>> GetAllRapsAsync();
        Task<RapDto?> GetRapByIdAsync(int id);
        Task<RapDto> CreateRapAsync(CreateRapDto dto);
        Task<RapDto?> UpdateRapAsync(int id, UpdateRapDto dto);
        Task<bool> DeleteRapAsync(int id);

        Task<IEnumerable<PhongChieuDto>> GetPhongChieusByRapIdAsync(int rapId);
        Task<PhongChieuDto?> GetPhongChieuByIdAsync(int id);
        Task<PhongChieuDto> CreatePhongChieuAsync(CreatePhongChieuDto dto);
        Task<PhongChieuDto?> UpdatePhongChieuAsync(int id, UpdatePhongChieuDto dto);
        Task<(bool Success, string Message)> DeletePhongChieuAsync(int id);

        Task<IEnumerable<GheDto>> GetGhesByPhongChieuAsync(int phongChieuId);
    }
}

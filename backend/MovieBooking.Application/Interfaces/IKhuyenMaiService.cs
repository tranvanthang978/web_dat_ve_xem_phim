using MovieBooking.Application.DTOs.Promotion;

namespace MovieBooking.Application.Interfaces
{
    public interface IKhuyenMaiService
    {
        Task<IEnumerable<KhuyenMaiDto>> GetAllKhuyenMaiAsync();
        Task<KhuyenMaiDto?> GetKhuyenMaiByIdAsync(int id);
        Task<KhuyenMaiDto> CreateKhuyenMaiAsync(CreateKhuyenMaiDto createKhuyenMaiDto);
        Task<KhuyenMaiDto?> UpdateKhuyenMaiAsync(int id, UpdateKhuyenMaiDto updateKhuyenMaiDto);
        Task<bool> DeleteKhuyenMaiAsync(int id);
    }
}

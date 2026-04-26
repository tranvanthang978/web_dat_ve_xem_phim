using MovieBooking.Application.DTOs.Promotion;

namespace MovieBooking.Application.Interfaces
{
    public interface IKhuyenMaiService
    {
        Task<IEnumerable<KhuyenMaiDto>> GetAllKhuyenMaiAsync();
        Task<KhuyenMaiDto?> GetKhuyenMaiByIdAsync(int id);
        /// <summary>Validate mã khuyến mãi — kiểm tra còn hiệu lực, còn lượt dùng</summary>
        Task<KhuyenMaiDto?> ValidateMaKhuyenMaiAsync(string ma);
        Task<KhuyenMaiDto> CreateKhuyenMaiAsync(CreateKhuyenMaiDto createKhuyenMaiDto);
        Task<KhuyenMaiDto?> UpdateKhuyenMaiAsync(int id, UpdateKhuyenMaiDto updateKhuyenMaiDto);
        Task<bool> DeleteKhuyenMaiAsync(int id);
    }
}

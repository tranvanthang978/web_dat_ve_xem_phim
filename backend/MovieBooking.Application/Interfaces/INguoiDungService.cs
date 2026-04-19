using MovieBooking.Application.DTOs.User;

namespace MovieBooking.Application.Interfaces
{
    public interface INguoiDungService
    {
        Task<IEnumerable<NguoiDungDto>> GetAllAsync();
        Task<NguoiDungDto?> GetByIdAsync(int id);
        Task<NguoiDungDto?> UpdateAsync(int id, UpdateNguoiDungDto dto);
        Task<bool> DeleteAsync(int id);
        Task<(bool Success, string Message)> ChangePasswordAsync(int id, ChangePasswordDto dto);
        Task<bool> UpdateVaiTroAsync(int id, string vaiTro);
        
        /// <summary>Tạo tài khoản admin mới</summary>
        Task<(bool Success, string Message, NguoiDungDto? Data)> CreateAdminAsync(string hoTen, string email, string matKhau);
    }
}


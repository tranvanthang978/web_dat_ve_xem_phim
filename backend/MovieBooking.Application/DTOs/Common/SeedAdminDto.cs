using System.ComponentModel.DataAnnotations;

namespace MovieBooking.Application.DTOs.Common
{
    /// <summary>DTO để tạo tài khoản Admin</summary>
    public class SeedAdminDto
    {
        /// <summary>Họ và tên</summary>
        [Required(ErrorMessage = "Họ tên không được để trống")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Họ tên phải từ 3-100 ký tự")]
        public string HoTen { get; set; } = string.Empty;

        /// <summary>Email</summary>
        [Required(ErrorMessage = "Email không được để trống")]
        [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
        public string Email { get; set; } = string.Empty;

        /// <summary>Mật khẩu</summary>
        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        [StringLength(128, MinimumLength = 8, ErrorMessage = "Mật khẩu phải từ 8-128 ký tự")]
        public string MatKhau { get; set; } = string.Empty;
    }
}

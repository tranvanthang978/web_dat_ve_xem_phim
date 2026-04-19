namespace MovieBooking.Application.DTOs.Auth
{
    public class LoginDto
    {
        /// <summary>Tên đăng nhập (Họ Tên từ cơ sở dữ liệu)</summary>
        public string TenDangNhap { get; set; } = string.Empty;
        
        /// <summary>Mật khẩu</summary>
        public string MatKhau { get; set; } = string.Empty;
    }
}

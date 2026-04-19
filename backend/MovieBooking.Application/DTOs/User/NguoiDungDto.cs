namespace MovieBooking.Application.DTOs.User
{
    public class NguoiDungDto
    {
        public int Id { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string TenDangNhap { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string VaiTro { get; set; } = string.Empty;
        public string SoDienThoai { get; set; } = string.Empty;
        public DateTime NgayTao { get; set; }
    }
}

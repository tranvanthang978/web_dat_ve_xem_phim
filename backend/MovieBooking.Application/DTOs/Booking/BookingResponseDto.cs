namespace MovieBooking.Application.DTOs.Booking
{
    public class BookingResponseDto
    {
        public int Id { get; set; }
        public decimal TongTien { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public DateTime NgayTao { get; set; }
        public string TenPhim { get; set; } = string.Empty;
        public DateTime GioBatDau { get; set; }
        public string TenRap { get; set; } = string.Empty;
        public string TenPhong { get; set; } = string.Empty;
        public List<string> DanhSachGhe { get; set; } = new();
    }
}

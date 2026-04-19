namespace MovieBooking.Application.DTOs.Showtime
{
    public class LichChieuDto
    {
        public int Id { get; set; }
        public DateTime GioBatDau { get; set; }
        public DateTime GioKetThuc { get; set; }
        public decimal GiaCoBan { get; set; }
        public int PhimId { get; set; }
        public string TenPhim { get; set; } = string.Empty;
        public int PhongChieuId { get; set; }
        public string TenPhong { get; set; } = string.Empty;
        public string TenRap { get; set; } = string.Empty;
    }
}

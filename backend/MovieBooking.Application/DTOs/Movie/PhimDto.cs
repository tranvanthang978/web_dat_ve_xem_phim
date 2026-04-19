namespace MovieBooking.Application.DTOs.Movie
{
    public class PhimDto
    {
        public int Id { get; set; }
        public string TenPhim { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;
        public string TrailerUrl { get; set; } = string.Empty;
        public string PosterUrl { get; set; } = string.Empty;
        public string BackdropUrl { get; set; } = string.Empty;
        public string TheLoai { get; set; } = string.Empty;
        public decimal XepHang { get; set; }
        public string DaoDien { get; set; } = string.Empty;
        public string DienVien { get; set; } = string.Empty;
        public int ThoiLuong { get; set; }
        public bool DangChieu { get; set; }
        public DateTime NgayTao { get; set; }
    }
}

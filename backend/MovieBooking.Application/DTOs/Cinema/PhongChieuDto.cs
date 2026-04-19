namespace MovieBooking.Application.DTOs.Cinema
{
    public class PhongChieuDto
    {
        public int Id { get; set; }
        public string TenPhong { get; set; } = string.Empty;
        public int RapId { get; set; }
        public string TenRap { get; set; } = string.Empty;

        public int SoHangGhe { get; set; }
        public int SoGheMotHang { get; set; }
    }
}

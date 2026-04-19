namespace MovieBooking.Application.DTOs.Cinema
{
    public class CreatePhongChieuDto
    {
        public string TenPhong { get; set; } = string.Empty;
        public int RapId { get; set; }
        public int SoHangGhe { get; set; }
        public int SoGheMotHang { get; set; }
    }
}

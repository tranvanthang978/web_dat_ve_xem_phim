namespace MovieBooking.Application.DTOs.Cinema
{
    public class GheDto
    {
        public int Id { get; set; }
        public string SoGhe { get; set; } = string.Empty;
        public string LoaiGhe { get; set; } = string.Empty;
        public int PhongChieuId { get; set; }
        public bool DaDat { get; set; }
    }
}

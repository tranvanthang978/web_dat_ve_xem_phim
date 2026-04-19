namespace MovieBooking.Application.DTOs.Promotion
{
    public class KhuyenMaiDto
    {
        public int Id { get; set; }
        public string MaKhuyenMai { get; set; }
        public decimal GiaTriGiam { get; set; }
        public DateTime NgayBatDau { get; set; }
        public DateTime NgayKetThuc { get; set; }
        public bool ConHieuLuc { get; set; }
        public int SoLuotSuDung { get; set; }
        public int SoLuotDaDung { get; set; }
        public decimal GiamToiDa { get; set; }
    }

    public class CreateKhuyenMaiDto
    {
        public string MaKhuyenMai { get; set; }
        public decimal GiaTriGiam { get; set; }
        public DateTime NgayBatDau { get; set; }
        public DateTime NgayKetThuc { get; set; }
        public int SoLuotSuDung { get; set; } = 0;
        public decimal GiamToiDa { get; set; } = 0;
    }

    public class UpdateKhuyenMaiDto
    {
        public string MaKhuyenMai { get; set; }
        public decimal GiaTriGiam { get; set; }
        public DateTime NgayBatDau { get; set; }
        public DateTime NgayKetThuc { get; set; }
        public bool ConHieuLuc { get; set; }
        public int SoLuotSuDung { get; set; }
        public decimal GiamToiDa { get; set; }
    }
}

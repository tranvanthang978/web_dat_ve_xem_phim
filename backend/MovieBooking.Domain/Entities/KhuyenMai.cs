using MovieBooking.Domain.Common;

namespace MovieBooking.Domain.Entities
{
    public class KhuyenMai : BaseEntity
    {
        public string MaKhuyenMai { get; set; } = string.Empty;
        public decimal GiaTriGiam { get; set; }       // Phần trăm giảm (1-100)
        public DateTime NgayBatDau { get; set; }
        public DateTime NgayKetThuc { get; set; }
        public bool ConHieuLuc { get; set; }
        public int SoLuotSuDung { get; set; } = 0;   // 0 = không giới hạn
        public int SoLuotDaDung { get; set; } = 0;
        public decimal GiamToiDa { get; set; } = 0;  // 0 = không giới hạn số tiền
    }
}

using MovieBooking.Domain.Common;

namespace MovieBooking.Domain.Entities
{
    public class ThanhToan : BaseEntity
    {
        public string PhuongThuc { get; set; } = string.Empty; // VNPay, ChuyenKhoan
        public string MaGiaoDich { get; set; } = string.Empty;
        public decimal SoTien { get; set; }
        public string TrangThai { get; set; } = string.Empty;  // Pending, ThanhCong, ThatBai

        public int DonDatVeId { get; set; }
        public DonDatVe DonDatVe { get; set; } = null!;
    }
}

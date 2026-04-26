using MovieBooking.Domain.Common;

namespace MovieBooking.Domain.Entities
{
    public class DonDatVe : BaseEntity
    {
        public decimal TongTien { get; set; }
        public string TrangThai { get; set; } = string.Empty; // Pending, Paid, Cancelled, Refunded

        public int NguoiDungId { get; set; }
        public NguoiDung NguoiDung { get; set; } = null!;

        public int LichChieuId { get; set; }
        public LichChieu LichChieu { get; set; } = null!;

        public ICollection<Ve> Ves { get; set; } = new List<Ve>();
        public ICollection<ThanhToan> ThanhToans { get; set; } = new List<ThanhToan>();
    }
}

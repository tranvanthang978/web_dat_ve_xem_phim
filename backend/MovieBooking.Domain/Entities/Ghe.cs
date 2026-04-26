using MovieBooking.Domain.Common;

namespace MovieBooking.Domain.Entities
{
    public class Ghe : BaseEntity
    {
        public string SoGhe { get; set; } = string.Empty;   // A1, A2...
        public string LoaiGhe { get; set; } = string.Empty; // VIP, Thuong

        public int PhongChieuId { get; set; }
        public PhongChieu PhongChieu { get; set; } = null!;

        public ICollection<Ve> Ves { get; set; } = new List<Ve>();
    }
}

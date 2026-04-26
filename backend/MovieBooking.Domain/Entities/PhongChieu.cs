using MovieBooking.Domain.Common;

namespace MovieBooking.Domain.Entities
{
    public class PhongChieu : BaseEntity
    {
        public string TenPhong { get; set; } = string.Empty;

        public int RapId { get; set; }
        public Rap Rap { get; set; } = null!;

        public ICollection<Ghe> Ghes { get; set; } = new List<Ghe>();
        public ICollection<LichChieu> LichChieus { get; set; } = new List<LichChieu>();
    }
}

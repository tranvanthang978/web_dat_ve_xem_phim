using MovieBooking.Domain.Common;

namespace MovieBooking.Domain.Entities
{
    public class LichChieu : BaseEntity
    {
        public DateTime GioBatDau { get; set; }
        public DateTime GioKetThuc { get; set; }
        public decimal GiaCoBan { get; set; }

        public int PhimId { get; set; }
        public Phim Phim { get; set; } = null!;

        public int PhongChieuId { get; set; }
        public PhongChieu PhongChieu { get; set; } = null!;

        public ICollection<DonDatVe> DonDatVes { get; set; } = new List<DonDatVe>();
    }
}

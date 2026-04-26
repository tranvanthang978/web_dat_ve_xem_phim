using MovieBooking.Domain.Common;

namespace MovieBooking.Domain.Entities
{
    public class Ve : BaseEntity
    {
        public int DonDatVeId { get; set; }
        public DonDatVe DonDatVe { get; set; } = null!;

        public int GheId { get; set; }
        public Ghe Ghe { get; set; } = null!;

        public decimal GiaVe { get; set; } // Giá tại thời điểm mua
    }
}

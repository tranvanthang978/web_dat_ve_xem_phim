using MovieBooking.Domain.Common;

namespace MovieBooking.Domain.Entities
{
    public class Rap : BaseEntity
    {
        public string TenRap { get; set; } = string.Empty;
        public string DiaChi { get; set; } = string.Empty;
        public string Hotline { get; set; } = string.Empty;

        public ICollection<PhongChieu> PhongChieus { get; set; } = new List<PhongChieu>();
    }
}

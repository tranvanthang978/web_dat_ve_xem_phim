using MovieBooking.Domain.Common;

namespace MovieBooking.Domain.Entities
{
    public class NguoiDung : BaseEntity
    {
        public string HoTen { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string MatKhauHash { get; set; } = string.Empty;
        public string VaiTro { get; set; } = string.Empty;
        public string SoDienThoai { get; set; } = string.Empty;
        public string TenDangNhap { get; set; } = string.Empty;
        public int TokenVersion { get; set; } = 0;

        public ICollection<DonDatVe> DonDatVes { get; set; } = new List<DonDatVe>();
    }
}

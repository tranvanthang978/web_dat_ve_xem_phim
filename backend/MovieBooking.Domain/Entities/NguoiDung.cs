using MovieBooking.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MovieBooking.Domain.Entities
{
    public class NguoiDung : BaseEntity
    {
        public string HoTen { get; set; }
        public string Email { get; set; }
        public string MatKhauHash { get; set; }
        public string VaiTro { get; set; }
        public string SoDienThoai { get; set; } = string.Empty;
        public string TenDangNhap { get; set; } = string.Empty;

        public ICollection<DonDatVe> DonDatVes { get; set; }
    }
}

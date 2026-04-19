using MovieBooking.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MovieBooking.Domain.Entities
{
    public class KhuyenMai : BaseEntity
    {
        public string MaKhuyenMai { get; set; }
        public decimal GiaTriGiam { get; set; } // %
        public DateTime NgayBatDau { get; set; }
        public DateTime NgayKetThuc { get; set; }
        public bool ConHieuLuc { get; set; }
        public int SoLuotSuDung { get; set; } = 0;  // 0 = không giới hạn
        public int SoLuotDaDung { get; set; } = 0;
        public decimal GiamToiDa { get; set; } = 0; // 0 = không giới hạn số tiền
    }
}

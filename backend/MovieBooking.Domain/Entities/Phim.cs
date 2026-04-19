using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MovieBooking.Domain.Common;

namespace MovieBooking.Domain.Entities
{
    public class Phim : BaseEntity
    {
        public string TenPhim { get; set; }
        public string MoTa { get; set; }
        public string TrailerUrl { get; set; }
        public string PosterUrl { get; set; } = string.Empty;
        public string BackdropUrl { get; set; } = string.Empty;
        public string TheLoai { get; set; } = string.Empty;
        public decimal XepHang { get; set; }
        public string DaoDien { get; set; }
        public string DienVien { get; set; }
        public int ThoiLuong { get; set; }
        public bool DangChieu { get; set; }

        public ICollection<LichChieu> LichChieus { get; set; }
    }
}

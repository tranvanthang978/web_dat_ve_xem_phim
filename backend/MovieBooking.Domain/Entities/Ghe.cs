using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MovieBooking.Domain.Entities
{
    public class Ghe
    {
        public int Id { get; set; }
        public string SoGhe { get; set; } // A1, A2...
        public string LoaiGhe { get; set; } // VIP, Thuong

        public int PhongChieuId { get; set; }
        public PhongChieu PhongChieu { get; set; }

        public ICollection<Ve> Ves { get; set; }
    }
}

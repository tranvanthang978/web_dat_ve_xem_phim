using MovieBooking.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MovieBooking.Domain.Entities
{
    public class LichChieu : BaseEntity
    {
        public DateTime GioBatDau { get; set; }
        public DateTime GioKetThuc { get; set; }
        public decimal GiaCoBan { get; set; }

        public int PhimId { get; set; }
        public Phim Phim { get; set; }

        public int PhongChieuId { get; set; }
        public PhongChieu PhongChieu { get; set; }

        public ICollection<DonDatVe> DonDatVes { get; set; }
    }
}

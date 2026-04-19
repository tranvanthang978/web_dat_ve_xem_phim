using MovieBooking.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MovieBooking.Domain.Entities
{
    public class PhongChieu : BaseEntity
    {
        public string TenPhong { get; set; }

        public int RapId { get; set; }
        public Rap Rap { get; set; }

        public ICollection<Ghe> Ghes { get; set; }
        public ICollection<LichChieu> LichChieus { get; set; }
    }
}

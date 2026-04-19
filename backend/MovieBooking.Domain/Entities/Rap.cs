using MovieBooking.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MovieBooking.Domain.Entities
{
    public class Rap : BaseEntity
    {
        public string TenRap { get; set; }
        public string DiaChi { get; set; }
        public string Hotline { get; set; }

        public ICollection<PhongChieu> PhongChieus { get; set; }
    }
}

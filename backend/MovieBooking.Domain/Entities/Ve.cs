using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MovieBooking.Domain.Entities
{
    public class Ve
    {
        public int Id { get; set; }

        public int DonDatVeId { get; set; }
        public DonDatVe DonDatVe { get; set; }

        public int GheId { get; set; }
        public Ghe Ghe { get; set; }

        public decimal GiaVe { get; set; } // Giá tại thời điểm mua
    }
}

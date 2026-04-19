using MovieBooking.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MovieBooking.Domain.Entities
{
    public class ThanhToan : BaseEntity
    {
        public string PhuongThuc { get; set; } // VNPay, Momo, TienMat
        public string MaGiaoDich { get; set; }
        public decimal SoTien { get; set; }
        public string TrangThai { get; set; } // ThanhCong, ThatBai

        public int DonDatVeId { get; set; }
        public DonDatVe DonDatVe { get; set; }
    }
}

namespace MovieBooking.Application.DTOs.Payment
{
    public class PaymentResponseDto
    {
        public int Id { get; set; }
        public string PhuongThuc { get; set; } = string.Empty;
        public string MaGiaoDich { get; set; } = string.Empty;
        public decimal SoTien { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public DateTime NgayTao { get; set; }
    }
}

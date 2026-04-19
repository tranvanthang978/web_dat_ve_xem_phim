namespace MovieBooking.Application.DTOs.Payment
{
    public class PaymentRequestDto
    {
        public int DonDatVeId { get; set; }
        public string PhuongThuc { get; set; } = string.Empty; // VNPay, Momo, TienMat
    }
}

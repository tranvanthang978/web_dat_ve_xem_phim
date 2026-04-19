namespace MovieBooking.Application.Interfaces
{
    public interface IVNPayService
    {
        /// <summary>Tạo URL thanh toán VNPay cho đơn đặt vé</summary>
        Task<(bool Success, string Message, string? PaymentUrl)> CreatePaymentUrlAsync(int donDatVeId, string ipAddress);

        /// <summary>Xử lý callback từ VNPay, verify chữ ký và cập nhật trạng thái đơn</summary>
        Task<(bool Success, string Message, int? DonDatVeId)> ProcessCallbackAsync(IDictionary<string, string> query);
    }
}

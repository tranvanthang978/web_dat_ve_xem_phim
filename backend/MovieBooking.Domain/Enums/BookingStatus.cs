namespace MovieBooking.Domain.Enums
{
    /// <summary>Trạng thái đơn đặt vé</summary>
    public enum BookingStatus
    {
        /// <summary>Chờ thanh toán</summary>
        Pending = 0,
        
        /// <summary>Đã thanh toán</summary>
        Paid = 1,
        
        /// <summary>Đã hủy</summary>
        Cancelled = 2,
        
        /// <summary>Hoàn tiền</summary>
        Refunded = 3
    }
}

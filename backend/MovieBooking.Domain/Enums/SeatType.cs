namespace MovieBooking.Domain.Enums
{
    /// <summary>Loại ghế — giá trị ToString() khớp với cột LoaiGhe trong DB</summary>
    public enum SeatType
    {
        /// <summary>Ghế thường</summary>
        Thuong = 0,

        /// <summary>Ghế VIP (giá x1.5)</summary>
        VIP = 1
    }
}

namespace MovieBooking.Application.DTOs.Booking
{
    public class BookingRequestDto
    {
        public int NguoiDungId { get; set; }
        public int LichChieuId { get; set; }
        public List<int> GheIds { get; set; } = new();
        public string? MaKhuyenMai { get; set; }
    }
}

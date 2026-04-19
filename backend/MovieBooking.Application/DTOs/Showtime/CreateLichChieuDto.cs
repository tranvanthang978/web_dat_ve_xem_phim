namespace MovieBooking.Application.DTOs.Showtime
{
    public class CreateLichChieuDto
    {
        public DateTime GioBatDau { get; set; }
        public DateTime GioKetThuc { get; set; }
        public decimal GiaCoBan { get; set; }
        public int PhimId { get; set; }
        public int PhongChieuId { get; set; }
    }
}

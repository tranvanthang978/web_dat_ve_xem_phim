namespace MovieBooking.Domain.Common
{
    public abstract class BaseEntity
    {
        public int Id { get; set; }
        public DateTime NgayTao { get; set; } = DateTime.Now;
        public DateTime? NgayCapNhat { get; set; }
    }
}

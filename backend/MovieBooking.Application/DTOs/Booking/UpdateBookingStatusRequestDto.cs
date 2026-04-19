using System.ComponentModel.DataAnnotations;

namespace MovieBooking.Application.DTOs.Booking
{
    public class UpdateBookingStatusRequestDto
    {
        [Required(ErrorMessage = "Trạng thái mới không được để trống")]
        public string TrangThai { get; set; } = string.Empty;
    }
}

using FluentValidation;
using MovieBooking.Application.DTOs.Booking;

namespace MovieBooking.Application.Validators
{
    public class BookingRequestDtoValidator : AbstractValidator<BookingRequestDto>
    {
        public BookingRequestDtoValidator()
        {
            RuleFor(x => x.NguoiDungId)
                .GreaterThan(0).WithMessage("Người dùng ID không hợp lệ");

            RuleFor(x => x.LichChieuId)
                .GreaterThan(0).WithMessage("Lịch chiếu ID không hợp lệ");

            RuleFor(x => x.GheIds)
                .NotEmpty().WithMessage("Phải chọn ít nhất 1 ghế")
                .Must(x => x.Count <= 10).WithMessage("Không được đặt quá 10 ghế trong 1 lần");
        }
    }
}

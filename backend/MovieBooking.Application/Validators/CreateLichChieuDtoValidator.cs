using FluentValidation;
using MovieBooking.Application.DTOs.Showtime;

namespace MovieBooking.Application.Validators
{
    public class CreateLichChieuDtoValidator : AbstractValidator<CreateLichChieuDto>
    {
        public CreateLichChieuDtoValidator()
        {
            RuleFor(x => x.GioBatDau)
                .NotEmpty().WithMessage("Giờ bắt đầu không được để trống")
                .GreaterThan(DateTime.UtcNow.AddMinutes(-30)).WithMessage("Giờ bắt đầu không hợp lệ");

            RuleFor(x => x.GioKetThuc)
                .NotEmpty().WithMessage("Giờ kết thúc không được để trống")
                .GreaterThan(x => x.GioBatDau).WithMessage("Giờ kết thúc phải sau giờ bắt đầu");

            RuleFor(x => x.GiaCoBan)
                .GreaterThan(0).WithMessage("Giá cơ bản phải lớn hơn 0")
                .LessThanOrEqualTo(1000000).WithMessage("Giá cơ bản không được quá 1,000,000 VNĐ");

            RuleFor(x => x.PhimId)
                .GreaterThan(0).WithMessage("Phim ID không hợp lệ");

            RuleFor(x => x.PhongChieuId)
                .GreaterThan(0).WithMessage("Phòng chiếu ID không hợp lệ");
        }
    }
}

using FluentValidation;
using MovieBooking.Application.DTOs.Cinema;

namespace MovieBooking.Application.Validators
{
    public class CreatePhongChieuDtoValidator : AbstractValidator<CreatePhongChieuDto>
    {
        public CreatePhongChieuDtoValidator()
        {
            RuleFor(x => x.TenPhong)
                .NotEmpty().WithMessage("Tên phòng không được để trống")
                .MaximumLength(100).WithMessage("Tên phòng không được quá 100 ký tự");

            RuleFor(x => x.RapId)
                .GreaterThan(0).WithMessage("Rạp ID không hợp lệ");

            RuleFor(x => x.SoHangGhe)
                .GreaterThan(0).WithMessage("Số hàng ghế phải lớn hơn 0")
                .LessThanOrEqualTo(20).WithMessage("Số hàng ghế không được quá 20");

            RuleFor(x => x.SoGheMotHang)
                .GreaterThan(0).WithMessage("Số ghế một hàng phải lớn hơn 0")
                .LessThanOrEqualTo(30).WithMessage("Số ghế một hàng không được quá 30");
        }
    }
}

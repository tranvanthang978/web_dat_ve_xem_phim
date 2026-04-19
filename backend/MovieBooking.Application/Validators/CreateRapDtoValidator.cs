using FluentValidation;
using MovieBooking.Application.DTOs.Cinema;

namespace MovieBooking.Application.Validators
{
    public class CreateRapDtoValidator : AbstractValidator<CreateRapDto>
    {
        public CreateRapDtoValidator()
        {
            RuleFor(x => x.TenRap)
                .NotEmpty().WithMessage("Tên rạp không được để trống")
                .MaximumLength(200).WithMessage("Tên rạp không được quá 200 ký tự");

            RuleFor(x => x.DiaChi)
                .NotEmpty().WithMessage("Địa chỉ không được để trống")
                .MaximumLength(500).WithMessage("Địa chỉ không được quá 500 ký tự");

            RuleFor(x => x.Hotline)
                .NotEmpty().WithMessage("Hotline không được để trống")
                .Matches(@"^[0-9]{10,11}$").WithMessage("Hotline phải là số điện thoại hợp lệ (10-11 số)");
        }
    }
}

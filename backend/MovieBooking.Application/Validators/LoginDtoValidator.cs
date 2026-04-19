using FluentValidation;
using MovieBooking.Application.DTOs.Auth;

namespace MovieBooking.Application.Validators
{
    public class LoginDtoValidator : AbstractValidator<LoginDto>
    {
        public LoginDtoValidator()
        {
            RuleFor(x => x.TenDangNhap)
                .NotEmpty().WithMessage("Tên đăng nhập không được để trống")
                .Length(3, 100).WithMessage("Tên đăng nhập phải từ 3-100 ký tự");

            RuleFor(x => x.MatKhau)
                .NotEmpty().WithMessage("Mật khẩu không được để trống")
                .MinimumLength(6).WithMessage("Mật khẩu phải có ít nhất 6 ký tự");
        }
    }
}

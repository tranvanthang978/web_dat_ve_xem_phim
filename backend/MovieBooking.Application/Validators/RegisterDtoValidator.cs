using FluentValidation;
using MovieBooking.Application.DTOs.Auth;

namespace MovieBooking.Application.Validators
{
    public class RegisterDtoValidator : AbstractValidator<RegisterDto>
    {
        public RegisterDtoValidator()
        {
            RuleFor(x => x.HoTen)
                .NotEmpty().WithMessage("Họ tên không được để trống")
                .Length(3, 100).WithMessage("Họ tên phải từ 3-100 ký tự");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email không được để trống")
                .EmailAddress().WithMessage("Email không hợp lệ");

            RuleFor(x => x.MatKhau)
                .NotEmpty().WithMessage("Mật khẩu không được để trống")
                .Length(8, 128).WithMessage("Mật khẩu phải từ 8-128 ký tự")
                .Matches(@"[A-Z]").WithMessage("Mật khẩu phải chứa ít nhất 1 chữ cái in hoa")
                .Matches(@"[a-z]").WithMessage("Mật khẩu phải chứa ít nhất 1 chữ cái thường")
                .Matches(@"[0-9]").WithMessage("Mật khẩu phải chứa ít nhất 1 chữ số");

            RuleFor(x => x.XacNhanMatKhau)
                .NotEmpty().WithMessage("Xác nhận mật khẩu không được để trống")
                .Equal(x => x.MatKhau).WithMessage("Mật khẩu xác nhận không khớp");
        }
    }
}

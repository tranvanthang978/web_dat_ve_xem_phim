using FluentValidation;
using MovieBooking.Application.DTOs.Movie;

namespace MovieBooking.Application.Validators
{
    public class CreatePhimDtoValidator : AbstractValidator<CreatePhimDto>
    {
        public CreatePhimDtoValidator()
        {
            RuleFor(x => x.TenPhim)
                .NotEmpty().WithMessage("Tên phim không được để trống")
                .MaximumLength(200).WithMessage("Tên phim không được quá 200 ký tự");

            RuleFor(x => x.MoTa)
                .NotEmpty().WithMessage("Mô tả không được để trống")
                .MaximumLength(1000).WithMessage("Mô tả không được quá 1000 ký tự");

            RuleFor(x => x.DaoDien)
                .NotEmpty().WithMessage("Đạo diễn không được để trống")
                .MaximumLength(200).WithMessage("Đạo diễn không được quá 200 ký tự");

            RuleFor(x => x.DienVien)
                .NotEmpty().WithMessage("Diễn viên không được để trống")
                .MaximumLength(500).WithMessage("Diễn viên không được quá 500 ký tự");

            RuleFor(x => x.ThoiLuong)
                .GreaterThan(0).WithMessage("Thời lượng phải lớn hơn 0")
                .LessThanOrEqualTo(300).WithMessage("Thời lượng không được quá 300 phút");
        }
    }
}

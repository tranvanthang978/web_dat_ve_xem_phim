using FluentValidation;
using MovieBooking.Application.DTOs.Payment;

namespace MovieBooking.Application.Validators
{
    public class PaymentRequestDtoValidator : AbstractValidator<PaymentRequestDto>
    {
        public PaymentRequestDtoValidator()
        {
            RuleFor(x => x.DonDatVeId)
                .GreaterThan(0).WithMessage("Đơn đặt vé ID không hợp lệ");

            RuleFor(x => x.PhuongThuc)
                .NotEmpty().WithMessage("Phương thức thanh toán không được để trống")
                .Must(x => new[] { "VNPay", "Momo", "TienMat" }.Contains(x))
                .WithMessage("Phương thức thanh toán phải là VNPay, Momo hoặc TienMat");
        }
    }
}

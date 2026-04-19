namespace MovieBooking.Application.Interfaces
{
    public interface IEmailService
    {
        Task SendBookingConfirmationAsync(int donDatVeId);
        Task SendPasswordResetOtpAsync(string toEmail, string hoTen, string otp);
    }
}

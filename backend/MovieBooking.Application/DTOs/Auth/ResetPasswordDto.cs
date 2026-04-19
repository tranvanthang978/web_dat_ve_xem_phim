namespace MovieBooking.Application.DTOs.Auth
{
    public class ResetPasswordDto
    {
        public string Email { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
        public string MatKhauMoi { get; set; } = string.Empty;
    }
}

using MovieBooking.Application.DTOs.Auth;

namespace MovieBooking.Application.Interfaces
{
    public interface IAuthService
    {
        Task<(bool Success, string Message, AuthResponseDto? Data)> RegisterAsync(RegisterDto registerDto);
        Task<(bool Success, string Message, AuthResponseDto? Data)> LoginAsync(LoginDto loginDto);
        Task<(bool Success, string Message)> GeneratePasswordResetTokenAsync(string email);
        Task<(bool Success, string Message)> VerifyOtpAsync(string email, string otp);
        Task<(bool Success, string Message)> ResetPasswordAsync(string email, string otp, string matKhauMoi);
    }
}

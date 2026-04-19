using Microsoft.AspNetCore.Mvc;
using MovieBooking.Application.DTOs.Auth;
using MovieBooking.Application.DTOs.Common;
using MovieBooking.Application.Interfaces;

namespace MovieBooking.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Dữ liệu không hợp lệ"));

            var (success, message, data) = await _authService.RegisterAsync(registerDto);

            if (!success)
                return BadRequest(ApiResponse<object>.ErrorResponse(message));

            return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(data!, message));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Dữ liệu không hợp lệ"));

            var (success, message, data) = await _authService.LoginAsync(loginDto);

            if (!success)
                return Unauthorized(ApiResponse<object>.ErrorResponse(message));

            return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(data!, message));
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Dữ liệu không hợp lệ"));

            var (success, message) = await _authService.GeneratePasswordResetTokenAsync(dto.Email);
            if (!success)
                return BadRequest(ApiResponse<object>.ErrorResponse(message));

            return Ok(ApiResponse<object>.SuccessResponse(null, message));
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Dữ liệu không hợp lệ"));

            var (success, message) = await _authService.VerifyOtpAsync(dto.Email, dto.Otp);
            if (!success)
                return BadRequest(ApiResponse<object>.ErrorResponse(message));

            return Ok(ApiResponse<object>.SuccessResponse(null, message));
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Dữ liệu không hợp lệ"));

            if (string.IsNullOrWhiteSpace(dto.MatKhauMoi))
                return BadRequest(ApiResponse<object>.ErrorResponse("Mật khẩu mới không được để trống"));

            var (success, message) = await _authService.ResetPasswordAsync(dto.Email, dto.Otp, dto.MatKhauMoi);
            if (!success)
                return BadRequest(ApiResponse<object>.ErrorResponse(message));

            return Ok(ApiResponse<object>.SuccessResponse(null, message));
        }
    }
}

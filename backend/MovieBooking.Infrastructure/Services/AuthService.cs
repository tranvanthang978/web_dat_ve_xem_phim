using AutoMapper;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MovieBooking.Application.DTOs.Auth;
using MovieBooking.Application.Interfaces;
using MovieBooking.Domain.Entities;
using MovieBooking.Domain.Enums;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MovieBooking.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private const string PasswordResetOtpCachePrefix = "PasswordResetOtp_";

        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IMemoryCache _cache;
        private readonly IEmailService _emailService;

        public AuthService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IConfiguration configuration,
            IPasswordHasher passwordHasher,
            IMemoryCache cache,
            IEmailService emailService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _configuration = configuration;
            _passwordHasher = passwordHasher ?? throw new ArgumentNullException(nameof(passwordHasher));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
        }

        public async Task<(bool Success, string Message, AuthResponseDto? Data)> RegisterAsync(RegisterDto registerDto)
        {
            var existingUser = await _unitOfWork.NguoiDungs.FirstOrDefaultAsync(u => u.Email == registerDto.Email);
            if (existingUser != null)
                return (false, "Email đã được sử dụng", null);

            var existingUsername = await _unitOfWork.NguoiDungs.FirstOrDefaultAsync(u => u.TenDangNhap == registerDto.HoTen);
            if (existingUsername != null)
                return (false, "Tên đăng nhập đã được sử dụng", null);

            var nguoiDung = _mapper.Map<NguoiDung>(registerDto);
            nguoiDung.MatKhauHash = _passwordHasher.HashPassword(registerDto.MatKhau);
            nguoiDung.VaiTro = UserRole.KhachHang.ToString();
            nguoiDung.TenDangNhap = registerDto.HoTen;
            nguoiDung.SoDienThoai = registerDto.SoDienThoai;

            await _unitOfWork.NguoiDungs.AddAsync(nguoiDung);
            await _unitOfWork.SaveChangesAsync();

            var token = GenerateJwtToken(nguoiDung);
            var response = new AuthResponseDto
            {
                UserId = nguoiDung.Id,
                HoTen = nguoiDung.HoTen,
                Email = nguoiDung.Email,
                VaiTro = nguoiDung.VaiTro,
                Token = token
            };

            return (true, "Đăng ký thành công", response);
        }

        public async Task<(bool Success, string Message, AuthResponseDto? Data)> LoginAsync(LoginDto loginDto)
        {
            var nguoiDung = await _unitOfWork.NguoiDungs.FirstOrDefaultAsync(u => u.TenDangNhap == loginDto.TenDangNhap);
            if (nguoiDung == null || !_passwordHasher.VerifyPassword(loginDto.MatKhau, nguoiDung.MatKhauHash))
                return (false, "Tên đăng nhập hoặc mật khẩu không đúng", null);

            var token = GenerateJwtToken(nguoiDung);
            var response = new AuthResponseDto
            {
                UserId = nguoiDung.Id,
                HoTen = nguoiDung.HoTen,
                TenDangNhap = nguoiDung.TenDangNhap,
                Email = nguoiDung.Email,
                VaiTro = nguoiDung.VaiTro,
                Token = token
            };

            return (true, "Đăng nhập thành công", response);
        }

        public async Task<(bool Success, string Message)> GeneratePasswordResetTokenAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return (false, "Email không được để trống");

            var nguoiDung = await _unitOfWork.NguoiDungs.FirstOrDefaultAsync(u => u.Email == email);
            if (nguoiDung == null)
                return (false, "Không tìm thấy người dùng với email này");

            var otp = GenerateOtp();
            var cacheKey = GetPasswordResetCacheKey(email);
            _cache.Set(cacheKey, otp, TimeSpan.FromMinutes(5));

            try
            {
                await _emailService.SendPasswordResetOtpAsync(email, nguoiDung.HoTen, otp);
            }
            catch (Exception ex)
            {
                // Log lỗi nhưng vẫn trả success — OTP đã lưu vào cache
                // Khi email chưa cấu hình, EmailService tự log OTP ra console để dev test
                Console.WriteLine($"[WARN] Gửi email OTP thất bại: {ex.Message}");
            }

            return (true, "Mã OTP đã được gửi tới email của bạn");
        }

        public async Task<(bool Success, string Message)> VerifyOtpAsync(string email, string otp)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(otp))
                return (false, "Thông tin không hợp lệ");

            var cacheKey = GetPasswordResetCacheKey(email);
            if (!_cache.TryGetValue<string>(cacheKey, out var savedOtp) || savedOtp != otp)
                return (false, "Mã OTP không đúng hoặc đã hết hạn");

            return (true, "OTP hợp lệ");
        }

        public async Task<(bool Success, string Message)> ResetPasswordAsync(string email, string otp, string matKhauMoi)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(otp) || string.IsNullOrWhiteSpace(matKhauMoi))
                return (false, "Thông tin không hợp lệ");

            var cacheKey = GetPasswordResetCacheKey(email);
            if (!_cache.TryGetValue<string>(cacheKey, out var savedOtp) || savedOtp != otp)
                return (false, "Mã OTP không hợp lệ hoặc đã hết hạn");

            var nguoiDung = await _unitOfWork.NguoiDungs.FirstOrDefaultAsync(u => u.Email == email);
            if (nguoiDung == null)
                return (false, "Người dùng không tồn tại");

            nguoiDung.MatKhauHash = _passwordHasher.HashPassword(matKhauMoi);
            _unitOfWork.NguoiDungs.Update(nguoiDung);
            await _unitOfWork.SaveChangesAsync();

            _cache.Remove(cacheKey);
            return (true, "Đặt lại mật khẩu thành công");
        }

        private string GenerateJwtToken(NguoiDung nguoiDung)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secret = jwtSettings["Secret"] ?? throw new InvalidOperationException("JWT Secret not configured");
            var issuer = jwtSettings["Issuer"] ?? throw new InvalidOperationException("JWT Issuer not configured");
            var audience = jwtSettings["Audience"] ?? throw new InvalidOperationException("JWT Audience not configured");
            
            if (!int.TryParse(jwtSettings["ExpiryMinutes"], out var expiryMinutes))
                expiryMinutes = 60; // Default 60 minutes

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, nguoiDung.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, nguoiDung.Email),
                new Claim(ClaimTypes.Name, nguoiDung.HoTen),
                new Claim(ClaimTypes.Role, nguoiDung.VaiTro),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string GenerateOtp()
        {
            var random = new Random();
            return random.Next(100000, 999999).ToString();
        }

        private static string GetPasswordResetCacheKey(string email)
        {
            return PasswordResetOtpCachePrefix + email.Trim().ToLowerInvariant();
        }
    }
}

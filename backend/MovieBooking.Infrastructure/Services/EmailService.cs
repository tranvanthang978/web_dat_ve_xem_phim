using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using MimeKit;
using MovieBooking.Application.Interfaces;
using MovieBooking.Infrastructure.Data;

namespace MovieBooking.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly MovieBookingDbContext _context;

        public EmailService(IConfiguration config, MovieBookingDbContext context)
        {
            _config = config;
            _context = context;
        }

        public async Task SendBookingConfirmationAsync(int donDatVeId)
        {
            var don = await _context.DonDatVes
                .Include(d => d.NguoiDung)
                .Include(d => d.LichChieu).ThenInclude(l => l.Phim)
                .Include(d => d.LichChieu).ThenInclude(l => l.PhongChieu).ThenInclude(p => p.Rap)
                .Include(d => d.Ves).ThenInclude(v => v.Ghe)
                .FirstOrDefaultAsync(d => d.Id == donDatVeId);

            if (don == null || string.IsNullOrEmpty(don.NguoiDung?.Email)) return;

            var cfg = _config.GetSection("Email");
            string senderEmail = cfg["SenderEmail"]!;
            string senderName  = cfg["SenderName"] ?? "TTA Movie";
            string password    = cfg["Password"]!;
            string smtpHost    = cfg["SmtpHost"] ?? "smtp.gmail.com";
            int    smtpPort    = int.TryParse(cfg["SmtpPort"], out var p) ? p : 587;

            // Thông tin vé
            string tenPhim   = don.LichChieu?.Phim?.TenPhim ?? "—";
            string tenRap    = don.LichChieu?.PhongChieu?.Rap?.TenRap ?? "—";
            string tenPhong  = don.LichChieu?.PhongChieu?.TenPhong ?? "—";
            string gioChieu  = don.LichChieu?.GioBatDau.ToString("HH:mm dd/MM/yyyy") ?? "—";
            string danhSachGhe = string.Join(", ", don.Ves.Select(v => v.Ghe?.SoGhe ?? "?"));
            string tongTien  = don.TongTien.ToString("N0") + "đ";
            string maDon     = $"TTA{don.Id:D6}";

            // QR data: chi tiết đơn để quầy scan
            string qrData    = $"Mã đơn: {maDon}\nPhim: {tenPhim}\nRạp: {tenRap}\nPhòng: {tenPhong}\nSuất chiếu: {gioChieu}\nGhế: {danhSachGhe}";
            string qrUrl     = $"https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={Uri.EscapeDataString(qrData)}";

            string html = $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'></head>
<body style='margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0' style='background:#f3f4f6;padding:40px 0;'>
    <tr><td align='center'>
      <table width='580' cellpadding='0' cellspacing='0' style='background:#ffffff;border-radius:16px;overflow:hidden;box-shadow: 0 4px 6px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.1);'>
        
        <!-- Header -->
        <tr>
          <td style='background:#e50914;padding:32px;text-align:center;'>
            <h1 style='margin:0;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:1px;'>
              TTA MOVIE
            </h1>
            <p style='margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;text-transform:uppercase;letter-spacing:1px;'>
              Xác nhận đặt vé thành công
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style='padding:32px;'>
            <p style='color:#1f2937;font-size:16px;font-weight:600;margin:0 0 12px;'>Xin chào {don.NguoiDung.HoTen},</p>
            <p style='color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;'>
              Chúc mừng bạn đã đặt vé thành công! Dưới đây là thông tin chi tiết cho trải nghiệm điện ảnh sắp tới của bạn.
            </p>

            <!-- Ticket Details Card -->
            <table width='100%' cellpadding='0' cellspacing='0' style='background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:24px;'>
              <tr>
                <td style='padding-bottom:16px;border-bottom:1px solid #e5e7eb;'>
                  <span style='color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;'>Phim</span><br>
                  <strong style='color:#111827;font-size:18px;display:block;margin-top:4px;'>{tenPhim}</strong>
                </td>
              </tr>
              <tr>
                <td style='padding:16px 0;border-bottom:1px solid #e5e7eb;'>
                  <table width='100%'>
                    <tr>
                      <td width='50%'>
                        <span style='color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;'>Rạp</span><br>
                        <span style='color:#374151;font-size:14px;font-weight:500;display:block;margin-top:4px;'>{tenRap}</span>
                      </td>
                      <td width='50%'>
                        <span style='color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;'>Phòng</span><br>
                        <span style='color:#374151;font-size:14px;font-weight:500;display:block;margin-top:4px;'>{tenPhong}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style='padding:16px 0;border-bottom:1px solid #e5e7eb;'>
                  <table width='100%'>
                    <tr>
                      <td width='50%'>
                        <span style='color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;'>Suất chiếu</span><br>
                        <span style='color:#374151;font-size:14px;font-weight:500;display:block;margin-top:4px;'>{gioChieu}</span>
                      </td>
                      <td width='50%'>
                        <span style='color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;'>Ghế</span><br>
                        <span style='color:#e50914;font-size:14px;font-weight:600;display:block;margin-top:4px;'>{danhSachGhe}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style='padding-top:16px;'>
                  <table width='100%'>
                    <tr>
                      <td width='50%'>
                        <span style='color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;'>Mã đơn hàng</span><br>
                        <span style='color:#111827;font-size:15px;font-weight:700;display:block;margin-top:4px;'>{maDon}</span>
                      </td>
                      <td width='50%'>
                        <span style='color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;'>Tổng tiền</span><br>
                        <span style='color:#111827;font-size:16px;font-weight:800;display:block;margin-top:4px;'>{tongTien}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- QR Section -->
            <div style='background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:24px; text-align:center;'>
              <p style='color:#6b7280;font-size:12px;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;font-weight:600;'>
                Quét mã này tại quầy để nhận vé
              </p>
              <div style='background:#ffffff; padding:12px; border:1px solid #e5e7eb; border-radius:12px; display:inline-block;'>
                <img src='{qrUrl}' width='180' height='180' style='display:block;' alt='QR Code Ticket' />
              </div>
            </div>

            <p style='color:#9ca3af;font-size:12px;text-align:center;margin:32px 0 0;'>
              Email này được gửi tự động từ hệ thống TTA Movie.<br>Vui lòng không trả lời email này.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style='background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;'>
            <p style='color:#9ca3af;font-size:12px;margin:0;'>© 2026 TTA Movie Cinema Group. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>";

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(senderName, senderEmail));
            message.To.Add(new MailboxAddress(don.NguoiDung.HoTen, don.NguoiDung.Email));
            message.Subject = $"[TTA Movie] Xác nhận đặt vé — {tenPhim}";
            message.Body = new TextPart("html") { Text = html };

            Console.WriteLine($"[EMAIL] Đang gửi email xác nhận vé tới {don.NguoiDung.Email}...");
            try
            {
                using var client = new SmtpClient();
                await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(senderEmail, password);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
                Console.WriteLine($"[EMAIL] Gửi email xác nhận vé thành công tới {don.NguoiDung.Email}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EMAIL ERROR] Gửi email xác nhận vé thất bại: {ex.Message}");
                Console.WriteLine($"[EMAIL ERROR] InnerException: {ex.InnerException?.Message}");
                Console.WriteLine($"[EMAIL ERROR] StackTrace: {ex.StackTrace}");
                throw; // Re-throw để caller biết
            }
        }

        public async Task SendPasswordResetOtpAsync(string toEmail, string hoTen, string otp)
        {
            if (string.IsNullOrWhiteSpace(toEmail)) return;

            var cfg = _config.GetSection("Email");
            string senderEmail = cfg["SenderEmail"] ?? string.Empty;
            string senderName = cfg["SenderName"] ?? "TTA Movie";
            string password = cfg["Password"] ?? string.Empty;
            string smtpHost = cfg["SmtpHost"] ?? "smtp.gmail.com";
            int smtpPort = int.TryParse(cfg["SmtpPort"], out var p) ? p : 587;

            string html = $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'></head>
<body style='margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0' style='background:#f3f4f6;padding:40px 0;'>
    <tr><td align='center'>
      <table width='540' cellpadding='0' cellspacing='0' style='background:#ffffff;border-radius:16px;overflow:hidden;box-shadow: 0 4px 6px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.1);'>
        
        <!-- Header -->
        <tr>
          <td style='background:#e50914;padding:32px;text-align:center;'>
            <h1 style='margin:0;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:1px;'>TTA MOVIE</h1>
            <p style='margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;text-transform:uppercase;'>Yêu cầu đặt lại mật khẩu</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style='padding:40px 32px;'>
            <p style='color:#1f2937;font-size:16px;font-weight:600;margin:0 0 16px;'>Xin chào {hoTen},</p>
            <p style='color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 32px;'>
              Bạn đã gửi yêu cầu đặt lại mật khẩu cho tài khoản tại TTA Movie. Vui lòng sử dụng mã xác nhận bên dưới:
            </p>

            <div style='background:#f9fafb; border-radius:12px; padding:32px; text-align:center; margin-bottom:32px; border:1px dashed #d1d5db;'>
              <p style='color:#6b7280;font-size:12px;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;font-weight:600;'>Mã OTP của bạn</p>
              <p style='color:#e50914;font-size:42px;font-weight:900;letter-spacing:8px;margin:0;'>{otp}</p>
            </div>

            <p style='color:#4b5563;font-size:14px;line-height:1.6;margin:0 0 32px;'>
              Lưu ý: Mã này chỉ có hiệu lực trong <strong>5 phút</strong>. Tuyệt đối không chia sẻ mã này với bất kỳ ai để bảo mật tài khoản.
            </p>

            <div style='background:#f3f4f6; border-radius:12px; padding:20px; border-left:4px solid #e50914;'>
              <p style='color:#1f2937;font-size:13px;font-weight:700;margin:0 0 8px;text-transform:uppercase;'>Hướng dẫn</p>
              <ul style='color:#4b5563;font-size:13px;line-height:1.6;margin:0;padding-left:18px;'>
                <li>Nhập mã OTP trên trang xác thực của ứng dụng.</li>
                <li>Thiết lập mật khẩu mới (nên bao gồm cả chữ và số).</li>
                <li>Nếu không phải bạn yêu cầu, hãy đổi mật khẩu tài khoản ngay lập tức.</li>
              </ul>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style='background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;'>
            <p style='color:#9ca3af;font-size:12px;margin:0;'>© 2026 TTA Movie Cinema Group. Email tự động.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>";

            // Nếu email chưa cấu hình thật (placeholder) → log OTP ra console để dev test
            bool isEmailConfigured = !string.IsNullOrWhiteSpace(senderEmail)
                && !string.IsNullOrWhiteSpace(password)
                && senderEmail != "your-email@gmail.com"
                && password != "your-app-password";

            if (!isEmailConfigured)
            {
                Console.WriteLine($"[DEV - OTP] Email chưa cấu hình. To={toEmail}, OTP={otp}");
                return;
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(senderName, senderEmail));
            message.To.Add(new MailboxAddress(hoTen, toEmail));
            message.Subject = "[TTA Movie] OTP đặt lại mật khẩu";
            message.Body = new TextPart("html") { Text = html };

            Console.WriteLine($"[EMAIL] Đang gửi OTP tới {toEmail}... (SMTP: {smtpHost}:{smtpPort}, From: {senderEmail})");
            try
            {
                using var client = new SmtpClient();
                await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(senderEmail, password);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
                Console.WriteLine($"[EMAIL] Gửi OTP thành công tới {toEmail}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EMAIL ERROR] Gửi OTP thất bại: {ex.Message}");
                Console.WriteLine($"[EMAIL ERROR] InnerException: {ex.InnerException?.Message}");
                Console.WriteLine($"[EMAIL ERROR] StackTrace: {ex.StackTrace}");
                throw; // Re-throw để AuthService log được
            }
        }
    }
}

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

            // QR data: mã đơn để quầy scan
            string qrData    = maDon;
            string qrUrl     = $"https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={Uri.EscapeDataString(qrData)}";

            string html = $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'></head>
<body style='margin:0;padding:0;background:#0a0c10;font-family:Arial,sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0' style='background:#0a0c10;padding:40px 0;'>
    <tr><td align='center'>
      <table width='560' cellpadding='0' cellspacing='0' style='background:#15171e;border-radius:16px;overflow:hidden;'>

        <!-- Header -->
        <tr>
          <td style='background:#e50914;padding:28px 32px;text-align:center;'>
            <h1 style='margin:0;color:#fff;font-size:26px;font-weight:900;letter-spacing:1px;'>
              <span>TTA</span><span style='color:#ffcdd2;'>Movie</span>
            </h1>
            <p style='margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;'>Xác nhận đặt vé thành công</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style='padding:32px;'>
            <p style='color:#9ca3af;font-size:14px;margin:0 0 24px;'>
              Xin chào <strong style='color:#fff;'>{don.NguoiDung.HoTen}</strong>,<br>
              Đơn đặt vé của bạn đã được xác nhận. Vui lòng xuất trình mã QR bên dưới tại quầy để nhận vé.
            </p>

            <!-- Movie info -->
            <table width='100%' cellpadding='0' cellspacing='0'
              style='background:#1f2128;border-radius:12px;padding:20px;margin-bottom:24px;'>
              <tr>
                <td style='padding:6px 0;'>
                  <span style='color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;'>Phim</span><br>
                  <strong style='color:#fff;font-size:16px;'>{tenPhim}</strong>
                </td>
              </tr>
              <tr><td style='border-top:1px solid #2d2f36;padding:12px 0 6px;'>
                <table width='100%'><tr>
                  <td width='50%'>
                    <span style='color:#6b7280;font-size:11px;text-transform:uppercase;'>Rạp</span><br>
                    <span style='color:#e5e7eb;font-size:13px;'>{tenRap}</span>
                  </td>
                  <td width='50%'>
                    <span style='color:#6b7280;font-size:11px;text-transform:uppercase;'>Phòng</span><br>
                    <span style='color:#e5e7eb;font-size:13px;'>{tenPhong}</span>
                  </td>
                </tr></table>
              </td></tr>
              <tr><td style='border-top:1px solid #2d2f36;padding:12px 0 6px;'>
                <table width='100%'><tr>
                  <td width='50%'>
                    <span style='color:#6b7280;font-size:11px;text-transform:uppercase;'>Suất chiếu</span><br>
                    <span style='color:#e5e7eb;font-size:13px;'>{gioChieu}</span>
                  </td>
                  <td width='50%'>
                    <span style='color:#6b7280;font-size:11px;text-transform:uppercase;'>Ghế</span><br>
                    <span style='color:#e5e7eb;font-size:13px;'>{danhSachGhe}</span>
                  </td>
                </tr></table>
              </td></tr>
              <tr><td style='border-top:1px solid #2d2f36;padding:12px 0 0;'>
                <table width='100%'><tr>
                  <td width='50%'>
                    <span style='color:#6b7280;font-size:11px;text-transform:uppercase;'>Mã đơn</span><br>
                    <span style='color:#e50914;font-size:14px;font-weight:700;'>{maDon}</span>
                  </td>
                  <td width='50%'>
                    <span style='color:#6b7280;font-size:11px;text-transform:uppercase;'>Tổng tiền</span><br>
                    <span style='color:#fff;font-size:14px;font-weight:700;'>{tongTien}</span>
                  </td>
                </tr></table>
              </td></tr>
            </table>

            <!-- QR Code -->
            <table width='100%' cellpadding='0' cellspacing='0'
              style='background:#1f2128;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;'>
              <tr><td>
                <p style='color:#9ca3af;font-size:12px;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;'>
                  Mã QR — Xuất trình tại quầy
                </p>
                <img src='{qrUrl}' width='180' height='180'
                  style='border-radius:8px;background:#fff;padding:8px;display:block;margin:0 auto;'
                  alt='QR Code {maDon}' />
                <p style='color:#6b7280;font-size:11px;margin:12px 0 0;'>{maDon}</p>
              </td></tr>
            </table>

            <p style='color:#4b5563;font-size:12px;text-align:center;margin:0;'>
              Email này được gửi tự động từ hệ thống TTA Movie. Vui lòng không trả lời email này.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style='background:#0d0f14;padding:16px 32px;text-align:center;'>
            <p style='color:#374151;font-size:11px;margin:0;'>© 2026 TTA Movie. All rights reserved.</p>
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

            using var client = new SmtpClient();
            await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(senderEmail, password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
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
<body style='margin:0;padding:0;background:#0a0c10;font-family:Arial,sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0' style='background:#0a0c10;padding:40px 0;'>
    <tr><td align='center'>
      <table width='560' cellpadding='0' cellspacing='0' style='background:#15171e;border-radius:16px;overflow:hidden;'>
        <tr>
          <td style='background:#e50914;padding:28px 32px;text-align:center;'>
            <h1 style='margin:0;color:#fff;font-size:26px;font-weight:900;'>TTA Movie</h1>
            <p style='margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;'>Yêu cầu đặt lại mật khẩu</p>
          </td>
        </tr>
        <tr>
          <td style='padding:32px;'>
            <p style='color:#9ca3af;font-size:14px;margin:0 0 24px;'>Xin chào <strong style='color:#fff;'>{hoTen}</strong>,</p>
            <p style='color:#fff;font-size:22px;font-weight:800;letter-spacing:0.12em;text-align:center;margin:0 0 20px;'>{otp}</p>
            <p style='color:#9ca3af;font-size:13px;line-height:1.7;'>Mã OTP này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã với bất kỳ ai.</p>
            <div style='margin-top:28px;padding:20px;border-radius:16px;background:#111827;'>
              <p style='color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;'>Hướng dẫn</p>
              <ul style='color:#d1d5db;font-size:13px;line-height:1.8;margin:0;padding-left:18px;'>
                <li>Nhập mã OTP trên trang quên mật khẩu.</li>
                <li>Thiết lập mật khẩu mới an toàn.</li>
                <li>Nếu bạn không yêu cầu thay đổi mật khẩu, hãy bỏ qua email này.</li>
              </ul>
            </div>
          </td>
        </tr>
        <tr>
          <td style='background:#0d0f14;padding:16px 32px;text-align:center;'>
            <p style='color:#374151;font-size:11px;margin:0;'>© 2026 TTA Movie. Email này được gửi tự động.</p>
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

            using var client = new SmtpClient();
            await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(senderEmail, password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}

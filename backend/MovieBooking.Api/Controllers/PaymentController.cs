using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieBooking.Application.Interfaces;
using MovieBooking.Infrastructure.Data;

namespace MovieBooking.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly IVNPayService _vnPayService;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _config;
        private readonly MovieBookingDbContext _dbContext;

        public PaymentController(IVNPayService vnPayService, IEmailService emailService, IConfiguration config, MovieBookingDbContext dbContext)
        {
            _vnPayService = vnPayService;
            _emailService = emailService;
            _config = config;
            _dbContext = dbContext;
        }

        [HttpPost("vnpay/create")]
        [Authorize]
        public async Task<IActionResult> CreateVNPayPayment([FromBody] CreateVNPayRequest request)
        {
            string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            // Nếu chạy qua proxy/localhost thì dùng IPv4
            if (ipAddress == "::1") ipAddress = "127.0.0.1";

            var (success, message, paymentUrl) = await _vnPayService.CreatePaymentUrlAsync(request.DonDatVeId, ipAddress);

            if (!success)
                return BadRequest(new { message });

            return Ok(new { paymentUrl });
        }

        [HttpGet("vnpay/callback")]
        [AllowAnonymous]
        public async Task<IActionResult> VNPayCallback()
        {
            // Convert IQueryCollection → IDictionary<string, string>
            var queryDict = Request.Query.ToDictionary(
                kvp => kvp.Key,
                kvp => kvp.Value.ToString()
            );

            var (success, message, donDatVeId) = await _vnPayService.ProcessCallbackAsync(queryDict);

            if (success && donDatVeId.HasValue)
            {
                // Gửi email xác nhận + QR (fire-and-forget, không block redirect)
                _ = Task.Run(async () =>
                {
                    try { await _emailService.SendBookingConfirmationAsync(donDatVeId.Value); }
                    catch { /* log nếu cần, không throw */ }
                });
            }

            string frontendBase = _config["Frontend:BaseUrl"] ?? "http://localhost:1607";

            if (success)
                return Redirect($"{frontendBase}/payment/result?status=success&orderId={donDatVeId}");

            return Redirect($"{frontendBase}/payment/result?status=failed&orderId={donDatVeId}&message={Uri.EscapeDataString(message)}");
        }

        [HttpGet("bank-transfer/info/{donDatVeId}")]
        [Authorize]
        public async Task<IActionResult> GetBankTransferInfo(int donDatVeId)
        {
            var bank          = _config.GetSection("BankTransfer");
            var accountNumber = bank["AccountNumber"]!;
            var accountName   = bank["AccountName"]!;
            var bankName      = bank["BankName"]!;
            var template      = bank["Template"] ?? "TTAVE{orderId}";
            var description   = template.Replace("{orderId}", donDatVeId.ToString());

            var don = await _dbContext.DonDatVes.FindAsync(donDatVeId);
            if (don == null) return NotFound(new { message = "Đơn không tồn tại" });

            long amount = (long)don.TongTien;

            var bankBins = new Dictionary<string, string>
            {
                ["MB Bank"] = "970422", ["Vietcombank"] = "970436", ["Techcombank"] = "970407",
                ["BIDV"] = "970418", ["VietinBank"] = "970415", ["Agribank"] = "970405",
                ["TPBank"] = "970423", ["VPBank"] = "970432", ["ACB"] = "970416",
            };
            bankBins.TryGetValue(bankName, out var bin);
            bin ??= "970422";

            var qrUrl = $"https://img.vietqr.io/image/{bin}-{accountNumber}-compact2.png" +
                        $"?amount={amount}&addInfo={Uri.EscapeDataString(description)}&accountName={Uri.EscapeDataString(accountName)}";

            return Ok(new { bankName, accountNumber, accountName, amount, description, qrUrl });
        }

        [HttpPost("bank-transfer/confirm")]
        [Authorize]
        public async Task<IActionResult> ConfirmBankTransfer([FromBody] BankTransferConfirmRequest request)
        {
            var don = await _dbContext.DonDatVes.FindAsync(request.DonDatVeId);
            if (don == null) return NotFound(new { message = "Đơn không tồn tại" });
            if (don.TrangThai == "Paid") return Ok(new { message = "Đơn đã được thanh toán" });

            don.TrangThai   = "Paid";
            don.NgayCapNhat = DateTime.Now;

            _dbContext.ThanhToans.Add(new MovieBooking.Domain.Entities.ThanhToan
            {
                DonDatVeId = request.DonDatVeId,
                PhuongThuc = "ChuyenKhoan",
                MaGiaoDich = $"BT{request.DonDatVeId}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}",
                SoTien     = don.TongTien,
                TrangThai  = "ThanhCong",
            });
            await _dbContext.SaveChangesAsync();

            _ = Task.Run(async () =>
            {
                try { await _emailService.SendBookingConfirmationAsync(request.DonDatVeId); }
                catch (Exception ex) { Console.WriteLine($"[WARN] Gửi email xác nhận thất bại: {ex.Message}"); }
            });

            return Ok(new { message = "Xác nhận thanh toán thành công" });
        }
    }

    public record CreateVNPayRequest(int DonDatVeId);
    public record BankTransferConfirmRequest(int DonDatVeId);
}

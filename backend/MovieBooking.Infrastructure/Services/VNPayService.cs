using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using MovieBooking.Application.Interfaces;
using MovieBooking.Domain.Entities;
using MovieBooking.Domain.Enums;
using MovieBooking.Infrastructure.Data;
using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace MovieBooking.Infrastructure.Services
{
    public class VNPayService : IVNPayService
    {
        private readonly IConfiguration _config;
        private readonly MovieBookingDbContext _context;

        public VNPayService(IConfiguration config, MovieBookingDbContext context)
        {
            _config = config;
            _context = context;
        }

        public async Task<(bool Success, string Message, string? PaymentUrl)> CreatePaymentUrlAsync(int donDatVeId, string ipAddress)
        {
            var don = await _context.DonDatVes
                .Include(d => d.LichChieu).ThenInclude(l => l.Phim)
                .FirstOrDefaultAsync(d => d.Id == donDatVeId);

            if (don == null)
                return (false, "Đơn đặt vé không tồn tại", null);

            if (don.TrangThai == BookingStatus.Paid.ToString())
                return (false, "Đơn đặt vé đã được thanh toán", null);

            if (don.TrangThai == BookingStatus.Cancelled.ToString())
                return (false, "Đơn đặt vé đã bị hủy", null);

            var vnp = _config.GetSection("VNPay");
            var tmnCode   = vnp["TmnCode"]!;
            var hashSecret = vnp["HashSecret"]!;
            var baseUrl   = vnp["BaseUrl"]!;
            var returnUrl = vnp["ReturnUrl"]!;
            var version   = vnp["Version"]!;
            var command   = vnp["Command"]!;
            var currCode  = vnp["CurrCode"]!;
            var locale    = vnp["Locale"]!;

            // Lấy thời gian GMT+7 (Việt Nam)
            TimeZoneInfo vnTimeZone;
            try
            {
                vnTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            }
            catch (TimeZoneNotFoundException)
            {
                vnTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Ho_Chi_Minh");
            }
            DateTime timeNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vnTimeZone);

            long amount = (long)(don.TongTien * 100);
            string txnRef = $"{donDatVeId}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";
            string createDate = timeNow.ToString("yyyyMMddHHmmss");
            string expireDate = timeNow.AddMinutes(15).ToString("yyyyMMddHHmmss");
            string orderInfo = $"Thanh toan ve xem phim cho don hang {donDatVeId}"; // Tránh ký tự có dấu gây lỗi chữ ký

            var rawData = new SortedDictionary<string, string>(new VnPayCompare())
            {
                ["vnp_Amount"]      = amount.ToString(),
                ["vnp_Command"]     = command,
                ["vnp_CreateDate"]  = createDate,
                ["vnp_CurrCode"]    = currCode,
                ["vnp_ExpireDate"]  = expireDate,
                ["vnp_IpAddr"]      = string.IsNullOrEmpty(ipAddress) ? "127.0.0.1" : ipAddress,
                ["vnp_Locale"]      = locale,
                ["vnp_OrderInfo"]   = orderInfo,
                ["vnp_OrderType"]   = "other",
                ["vnp_ReturnUrl"]   = returnUrl,
                ["vnp_TmnCode"]     = tmnCode,
                ["vnp_TxnRef"]      = txnRef,
                ["vnp_Version"]     = version,
            };

            string queryString = BuildQueryString(rawData);
            string secureHash  = HmacSHA512(hashSecret, queryString);
            string paymentUrl  = $"{baseUrl}?{queryString}&vnp_SecureHash={secureHash}";

            var thanhToan = new ThanhToan
            {
                DonDatVeId  = donDatVeId,
                PhuongThuc  = "VNPay",
                MaGiaoDich  = txnRef,
                SoTien      = don.TongTien,
                TrangThai   = "Pending",
            };
            _context.ThanhToans.Add(thanhToan);
            await _context.SaveChangesAsync();

            return (true, "Tạo URL thanh toán thành công", paymentUrl);
        }

        public async Task<(bool Success, string Message, int? DonDatVeId)> ProcessCallbackAsync(IDictionary<string, string> query)
        {
            var vnp = _config.GetSection("VNPay");
            string hashSecret = vnp["HashSecret"]!;

            // Lấy secure hash từ VNPay gửi về
            string vnpSecureHash = query.TryGetValue("vnp_SecureHash", out var h) ? h : "";

            // Build lại raw data (loại bỏ vnp_SecureHash và vnp_SecureHashType)
            var rawData = new SortedDictionary<string, string>(new VnPayCompare());
            foreach (var (key, value) in query)
            {
                if (key.StartsWith("vnp_") && key != "vnp_SecureHash" && key != "vnp_SecureHashType")
                    rawData[key] = value;
            }

            string queryString    = BuildQueryString(rawData);
            string computedHash   = HmacSHA512(hashSecret, queryString);

            // Verify chữ ký
            if (!computedHash.Equals(vnpSecureHash, StringComparison.OrdinalIgnoreCase))
                return (false, "Chữ ký không hợp lệ", null);

            string responseCode = query.TryGetValue("vnp_ResponseCode", out var rc) ? rc : "";
            string txnRef       = query.TryGetValue("vnp_TxnRef", out var tr) ? tr : "";

            // txnRef = "{donDatVeId}_{timestamp}"
            if (!int.TryParse(txnRef.Split('_')[0], out int donDatVeId))
                return (false, "Mã giao dịch không hợp lệ", null);

            var don = await _context.DonDatVes.FirstOrDefaultAsync(d => d.Id == donDatVeId);
            if (don == null)
                return (false, "Đơn đặt vé không tồn tại", null);

            // Tìm ThanhToan tương ứng
            var thanhToan = await _context.ThanhToans
                .Where(t => t.DonDatVeId == donDatVeId && t.MaGiaoDich == txnRef)
                .FirstOrDefaultAsync();

            bool isSuccess = responseCode == "00";

            if (thanhToan != null)
            {
                thanhToan.TrangThai   = isSuccess ? "ThanhCong" : "ThatBai";
                thanhToan.MaGiaoDich  = query.TryGetValue("vnp_TransactionNo", out var tn) ? tn : txnRef;
                _context.ThanhToans.Update(thanhToan);
            }

            if (isSuccess && don.TrangThai != BookingStatus.Paid.ToString())
            {
                don.TrangThai    = BookingStatus.Paid.ToString();
                don.ExpiredAt    = null; // Đã thanh toán, không cần hết hạn nữa
                don.NgayCapNhat  = DateTime.Now;
                _context.DonDatVes.Update(don);
            }
            else if (!isSuccess && don.TrangThai == BookingStatus.Pending.ToString())
            {
                // User hủy giao dịch (code 24) hoặc lỗi thanh toán → hủy đơn, nhả ghế
                don.TrangThai    = BookingStatus.Cancelled.ToString();
                don.NgayCapNhat  = DateTime.Now;
                _context.DonDatVes.Update(don);
            }

            await _context.SaveChangesAsync();

            return isSuccess
                ? (true, "Thanh toán thành công", donDatVeId)
                : (false, $"Thanh toán thất bại (mã: {responseCode})", donDatVeId);
        }

        // ── Helpers ──────────────────────────────────────────────────────────

        private static string BuildQueryString(SortedDictionary<string, string> data)
        {
            var sb = new StringBuilder();
            foreach (var (key, value) in data)
            {
                if (!string.IsNullOrEmpty(value))
                {
                    if (sb.Length > 0) sb.Append('&');
                    sb.Append(WebUtility.UrlEncode(key));
                    sb.Append('=');
                    sb.Append(WebUtility.UrlEncode(value));
                }
            }
            return sb.ToString();
        }

        private static string HmacSHA512(string key, string data)
        {
            using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(key));
            byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
            return BitConverter.ToString(hash).Replace("-", "").ToLower();
        }
    }

    public class VnPayCompare : IComparer<string>
    {
        public int Compare(string? x, string? y)
        {
            if (x == y) return 0;
            if (x == null) return -1;
            if (y == null) return 1;
            return string.Compare(x, y, StringComparison.Ordinal);
        }
    }
}

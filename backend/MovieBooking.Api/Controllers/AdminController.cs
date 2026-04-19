using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using MovieBooking.Application.DTOs.Booking;
using MovieBooking.Application.DTOs.Common;
using MovieBooking.Application.Interfaces;
using MovieBooking.Infrastructure.Data;

namespace MovieBooking.Api.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")] // All endpoints require Admin role
    public class AdminController : ControllerBase
    {
        private readonly MovieBookingDbContext _context;
        private readonly INguoiDungService _nguoiDungService;
        private readonly IBookingService _bookingService;

        public AdminController(MovieBookingDbContext context, INguoiDungService nguoiDungService, IBookingService bookingService)
        {
            _context = context;
            _nguoiDungService = nguoiDungService ?? throw new ArgumentNullException(nameof(nguoiDungService));
            _bookingService = bookingService ?? throw new ArgumentNullException(nameof(bookingService));
        }

        /// <summary>GET /api/admin/thong-ke — Dashboard stats</summary>
        [HttpGet("thong-ke")]
        public async Task<IActionResult> GetThongKe()
        {
            var tongPhim = await _context.Phims.CountAsync();
            var dangChieu = await _context.Phims.CountAsync(p => p.DangChieu);
            var tongRap = await _context.Raps.CountAsync();
            var tongNguoiDung = await _context.NguoiDungs.CountAsync();
            var tongDonDat = await _context.DonDatVes.CountAsync();
            var paidStatuses = new[] { "DaThanhToan", "Paid" };
            var tongDoanhThu = await _context.DonDatVes
                .Where(d => paidStatuses.Contains(d.TrangThai))
                .SumAsync(d => (decimal?)d.TongTien) ?? 0;

            var tongVeBan = await _context.Ves
                .Where(v => paidStatuses.Contains(v.DonDatVe.TrangThai))
                .CountAsync();

            var donDatHomNay = await _context.DonDatVes
                .Where(d => d.NgayTao.Date == DateTime.Today)
                .CountAsync();

            var doanhThuThang = await _context.DonDatVes
                .Where(d => paidStatuses.Contains(d.TrangThai)
                    && d.NgayTao.Month == DateTime.Today.Month
                    && d.NgayTao.Year == DateTime.Today.Year)
                .SumAsync(d => (decimal?)d.TongTien) ?? 0;

            var topPhim = await _context.DonDatVes
                .GroupBy(d => new { d.LichChieu.PhimId, d.LichChieu.Phim.TenPhim, d.LichChieu.Phim.PosterUrl })
                .Select(g => new
                {
                    g.Key.TenPhim,
                    g.Key.PosterUrl,
                    SoDon = g.Count(),
                    DoanhThu = g.Sum(d => d.TongTien)
                })
                .OrderByDescending(x => x.SoDon)
                .ThenByDescending(x => x.DoanhThu)
                .Take(3)
                .ToListAsync();

            var doanhThu7Ngay = await _context.DonDatVes
                .Where(d => d.NgayTao >= DateTime.Today.AddDays(-6))
                .GroupBy(d => d.NgayTao.Date)
                .Select(g => new { Ngay = g.Key, DoanhThu = g.Sum(d => d.TongTien), SoDon = g.Count() })
                .OrderBy(x => x.Ngay)
                .ToListAsync();

            var tyLeLapDay = tongDonDat == 0 ? 0 : Math.Round((double)donDatHomNay / tongDonDat * 100, 1);

            var stats = new
            {
                tongPhim, dangChieu, tongRap, tongNguoiDung,
                tongDonDat, tongVeBan, tongDoanhThu, donDatHomNay, doanhThuThang,
                tyLeLapDay,
                topPhim, doanhThu7Ngay
            };

            return Ok(ApiResponse<object>.SuccessResponse(stats));
        }

        /// <summary>GET /api/admin/export/bookings — Xuất CSV đơn đặt vé</summary>
        [HttpGet("export/bookings")]
        public async Task<IActionResult> ExportBookingsCsv()
        {
            var bookings = await _context.DonDatVes
                .Include(d => d.NguoiDung)
                .Include(d => d.LichChieu).ThenInclude(l => l.Phim)
                .Include(d => d.LichChieu).ThenInclude(l => l.PhongChieu).ThenInclude(p => p.Rap)
                .Include(d => d.Ves).ThenInclude(v => v.Ghe)
                .OrderByDescending(d => d.NgayTao)
                .ToListAsync();

            var headers = new[]
            {
                "Mã đơn", "Họ tên", "Email", "Tên phim",
                "Rạp", "Phòng chiếu", "Giờ chiếu", "Danh sách ghế",
                "Tổng tiền (VNĐ)", "Trạng thái", "Ngày đặt"
            };

            static string EscapeCsv(string? value)
            {
                if (string.IsNullOrEmpty(value))
                    return string.Empty;

                var escaped = value.Replace("\"", "\"\"");
                if (escaped.Contains(',') || escaped.Contains('"') || escaped.Contains('\n') || escaped.Contains('\r'))
                    return $"\"{escaped}\"";

                return escaped;
            }

            var sb = new System.Text.StringBuilder();
            sb.AppendLine(string.Join(',', headers.Select(EscapeCsv)));

            foreach (var d in bookings)
            {
                var ghes = string.Join(", ", d.Ves.Select(v => v.Ghe?.SoGhe ?? string.Empty));
                var trangThai = d.TrangThai switch
                {
                    "Pending"   => "Chờ thanh toán",
                    "Paid"      => "Đã thanh toán",
                    "Cancelled" => "Đã hủy",
                    "Refunded"  => "Đã hoàn tiền",
                    _           => d.TrangThai
                };

                var row = new[]
                {
                    $"TTA{d.Id:D6}",
                    d.NguoiDung?.HoTen ?? string.Empty,
                    d.NguoiDung?.Email ?? string.Empty,
                    d.LichChieu?.Phim?.TenPhim ?? string.Empty,
                    d.LichChieu?.PhongChieu?.Rap?.TenRap ?? string.Empty,
                    d.LichChieu?.PhongChieu?.TenPhong ?? string.Empty,
                    d.LichChieu?.GioBatDau.ToString("HH:mm dd/MM/yyyy") ?? string.Empty,
                    ghes,
                    d.TongTien.ToString("N0"),
                    trangThai,
                    d.NgayTao.ToString("dd/MM/yyyy HH:mm")
                };

                sb.AppendLine(string.Join(',', row.Select(EscapeCsv)));
            }

            var csvContent = sb.ToString();
            var utf8Bom = System.Text.Encoding.UTF8.GetPreamble();
            var body = System.Text.Encoding.UTF8.GetBytes(csvContent);
            var result = new byte[utf8Bom.Length + body.Length];
            Buffer.BlockCopy(utf8Bom, 0, result, 0, utf8Bom.Length);
            Buffer.BlockCopy(body, 0, result, utf8Bom.Length, body.Length);

            return File(result,
                "text/csv; charset=utf-8",
                $"DonDatVe_{DateTime.Now:yyyyMMdd_HHmm}.csv");
        }

        [HttpPut("bookings/{id}/status")]
        public async Task<IActionResult> UpdateBookingStatus(int id, [FromBody] UpdateBookingStatusRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Dữ liệu không hợp lệ"));

            var (success, message) = await _bookingService.UpdateBookingStatusAsync(id, request.TrangThai);
            if (!success)
                return BadRequest(ApiResponse<object>.ErrorResponse(message));

            return Ok(ApiResponse<object>.SuccessResponse(null!, message));
        }
    }
}


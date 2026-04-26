using Microsoft.EntityFrameworkCore;
using MovieBooking.Domain.Enums;
using MovieBooking.Infrastructure.Data;

namespace MovieBooking.Infrastructure.Services
{
    /// <summary>
    /// "Thủ kho" — tập hợp các hàm an toàn mà AI được phép gọi.
    /// AI không bao giờ trực tiếp truy cập DB, chỉ được gọi các hàm này.
    /// </summary>
    public class MovieTools
    {
        private readonly MovieBookingDbContext _context;

        public MovieTools(MovieBookingDbContext context)
        {
            _context = context;
        }

        /// <summary>Lấy danh sách phim đang chiếu</summary>
        public async Task<string> GetDangChieuAsync()
        {
            var phims = await _context.Phims
                .Where(p => p.DangChieu)
                .Select(p => new { p.TenPhim, p.TheLoai, p.ThoiLuong, p.XepHang })
                .ToListAsync();

            if (!phims.Any()) return "Hiện tại chưa có phim đang chiếu.";

            var lines = phims.Select(p =>
                $"- {p.TenPhim} | Thể loại: {p.TheLoai} | {p.ThoiLuong} phút | Đánh giá: {p.XepHang}/5");
            return "Phim đang chiếu:\n" + string.Join("\n", lines);
        }

        /// <summary>Lấy danh sách phim sắp chiếu</summary>
        public async Task<string> GetSapChieuAsync()
        {
            var phims = await _context.Phims
                .Where(p => !p.DangChieu)
                .Select(p => new { p.TenPhim, p.TheLoai, p.ThoiLuong })
                .ToListAsync();

            if (!phims.Any()) return "Hiện tại chưa có phim sắp chiếu.";

            var lines = phims.Select(p =>
                $"- {p.TenPhim} | Thể loại: {p.TheLoai} | {p.ThoiLuong} phút");
            return "Phim sắp chiếu:\n" + string.Join("\n", lines);
        }

        /// <summary>Lấy lịch chiếu của một bộ phim theo tên (tìm gần đúng)</summary>
        public async Task<string> GetLichChieuAsync(string tenPhim)
        {
            var now = DateTime.Now;
            var lichChieus = await _context.LichChieus
                .Include(l => l.Phim)
                .Include(l => l.PhongChieu).ThenInclude(p => p.Rap)
                .Where(l => EF.Functions.Like(l.Phim.TenPhim, $"%{tenPhim}%")
                         && l.GioBatDau >= now)
                .OrderBy(l => l.GioBatDau)
                .Take(10)
                .Select(l => new
                {
                    l.Phim.TenPhim,
                    Rap = l.PhongChieu.Rap.TenRap,
                    Phong = l.PhongChieu.TenPhong,
                    GioBatDau = l.GioBatDau,
                    l.GiaCoBan
                })
                .ToListAsync();

            if (!lichChieus.Any())
                return $"Không tìm thấy lịch chiếu nào cho phim '{tenPhim}' từ thời điểm hiện tại.";

            var lines = lichChieus.Select(l =>
                $"- {l.TenPhim} | {l.Rap} - {l.Phong} | {l.GioBatDau:HH:mm dd/MM/yyyy} | Giá: {l.GiaCoBan:N0}đ");
            return $"Lịch chiếu phim '{tenPhim}':\n" + string.Join("\n", lines);
        }

        /// <summary>Lấy thông tin chi tiết một bộ phim theo tên</summary>
        public async Task<string> GetThongTinPhimAsync(string tenPhim)
        {
            var phim = await _context.Phims
                .Where(p => EF.Functions.Like(p.TenPhim, $"%{tenPhim}%"))
                .FirstOrDefaultAsync();

            if (phim == null) return $"Không tìm thấy phim '{tenPhim}'.";

            return $"Thông tin phim:\n" +
                   $"- Tên: {phim.TenPhim}\n" +
                   $"- Thể loại: {phim.TheLoai}\n" +
                   $"- Thời lượng: {phim.ThoiLuong} phút\n" +
                   $"- Đạo diễn: {phim.DaoDien}\n" +
                   $"- Diễn viên: {phim.DienVien}\n" +
                   $"- Đánh giá: {phim.XepHang}/5\n" +
                   $"- Trạng thái: {(phim.DangChieu ? "Đang chiếu" : "Sắp chiếu")}\n" +
                   $"- Nội dung: {phim.MoTa}";
        }

        /// <summary>Lấy danh sách rạp chiếu phim</summary>
        public async Task<string> GetDanhSachRapAsync()
        {
            var raps = await _context.Raps
                .Select(r => new { r.TenRap, r.DiaChi, r.Hotline })
                .ToListAsync();

            if (!raps.Any()) return "Chưa có thông tin rạp.";

            var lines = raps.Select(r =>
                $"- {r.TenRap} | Địa chỉ: {r.DiaChi} | Hotline: {r.Hotline}");
            return "Danh sách rạp TTA Movie:\n" + string.Join("\n", lines);
        }

        /// <summary>Lấy danh sách khuyến mãi đang áp dụng</summary>
        public async Task<string> GetKhuyenMaiAsync()
        {
            var now = DateTime.Now;
            var kms = await _context.KhuyenMais
                .Where(k => k.NgayBatDau <= now && k.NgayKetThuc >= now)
                .Select(k => new { k.MaKhuyenMai, k.GiaTriGiam, k.NgayKetThuc })
                .ToListAsync();

            if (!kms.Any()) return "Hiện tại không có chương trình khuyến mãi nào.";

            var lines = kms.Select(k =>
                $"- Mã: {k.MaKhuyenMai} | Giảm: {k.GiaTriGiam}% | HSD: {k.NgayKetThuc:dd/MM/yyyy}");
            return "Khuyến mãi đang áp dụng:\n" + string.Join("\n", lines);
        }

        /// <summary>Đếm số ghế trống còn lại của một suất chiếu (theo tên phim, hoặc theo lichChieuId)</summary>
        public async Task<string> GetGheTrongAsync(string tenPhim)
        {
            var now = DateTime.Now;

            // Lấy các suất chiếu sắp tới của phim
            var lichChieus = await _context.LichChieus
                .Include(l => l.Phim)
                .Include(l => l.PhongChieu).ThenInclude(p => p.Rap)
                .Include(l => l.PhongChieu).ThenInclude(p => p.Ghes)
                .Where(l => EF.Functions.Like(l.Phim.TenPhim, $"%{tenPhim}%") && l.GioBatDau >= now)
                .OrderBy(l => l.GioBatDau)
                .Take(5)
                .ToListAsync();

            if (!lichChieus.Any())
                return $"Không tìm thấy suất chiếu nào cho phim '{tenPhim}'.";

            var result = new List<string>();
            foreach (var lc in lichChieus)
            {
                // Ghế đã bán trong suất này
                var daBanIds = await _context.Ves
                    .Where(v => v.DonDatVe.LichChieuId == lc.Id &&
                                v.DonDatVe.TrangThai != "Cancelled")
                    .Select(v => v.GheId)
                    .ToListAsync();

                int tongGhe  = lc.PhongChieu.Ghes.Count;
                int daBan    = daBanIds.Count;
                int conTrong = tongGhe - daBan;

                result.Add($"- {lc.Phim.TenPhim} | {lc.PhongChieu.Rap.TenRap} - {lc.PhongChieu.TenPhong} | " +
                           $"{lc.GioBatDau:HH:mm dd/MM} | Còn trống: {conTrong}/{tongGhe} ghế");
            }

            return $"Tình trạng ghế trống phim '{tenPhim}':\n" + string.Join("\n", result);
        }

        /// <summary>Lấy giá vé từng loại ghế của một suất chiếu theo tên phim</summary>
        public async Task<string> GetGiaVeAsync(string tenPhim)
        {
            var now = DateTime.Now;

            var lichChieu = await _context.LichChieus
                .Include(l => l.Phim)
                .Include(l => l.PhongChieu).ThenInclude(p => p.Ghes)
                .Where(l => EF.Functions.Like(l.Phim.TenPhim, $"%{tenPhim}%") && l.GioBatDau >= now)
                .OrderBy(l => l.GioBatDau)
                .FirstOrDefaultAsync();

            if (lichChieu == null)
                return $"Không tìm thấy suất chiếu nào cho phim '{tenPhim}'.";

            // Nhóm loại ghế và tính giá
            var loaiGhes = lichChieu.PhongChieu.Ghes
                .GroupBy(g => string.IsNullOrEmpty(g.LoaiGhe) ? SeatType.Thuong.ToString() : g.LoaiGhe)
                .Select(g => new { LoaiGhe = g.Key, SoLuong = g.Count() })
                .ToList();

            var lines = loaiGhes.Select(lg =>
            {
                decimal gia = lg.LoaiGhe.Equals(SeatType.VIP.ToString(), StringComparison.OrdinalIgnoreCase)
                    ? lichChieu.GiaCoBan * 1.5m
                    : lichChieu.GiaCoBan;
                return $"- {lg.LoaiGhe}: {gia:N0}đ ({lg.SoLuong} ghế)";
            });

            return $"Giá vé phim '{lichChieu.Phim.TenPhim}':\n" + string.Join("\n", lines) +
                   $"\n(Giá cơ bản: {lichChieu.GiaCoBan:N0}đ | VIP: x1.5)";
        }

        /// <summary>Lọc phim theo điều kiện: thể loại, trạng thái, xếp hạng tối thiểu</summary>
        public async Task<string> LocPhimAsync(string? theLoai, string? trangThai, string? xepHangToiThieu)
        {
            var query = _context.Phims.AsQueryable();

            if (!string.IsNullOrWhiteSpace(theLoai))
                query = query.Where(p => EF.Functions.Like(p.TheLoai, $"%{theLoai}%"));

            if (!string.IsNullOrWhiteSpace(trangThai))
            {
                bool dangChieu = trangThai.ToLower().Contains("đang") || trangThai.ToLower().Contains("dang");
                query = query.Where(p => p.DangChieu == dangChieu);
            }

            if (decimal.TryParse(xepHangToiThieu, out decimal minRating))
                query = query.Where(p => p.XepHang >= minRating);

            var phims = await query
                .OrderByDescending(p => p.XepHang)
                .Select(p => new { p.TenPhim, p.TheLoai, p.ThoiLuong, p.XepHang, p.DangChieu })
                .Take(10)
                .ToListAsync();

            if (!phims.Any()) return "Không tìm thấy phim nào phù hợp với điều kiện lọc.";

            var lines = phims.Select(p =>
                $"- {p.TenPhim} | {p.TheLoai} | {p.ThoiLuong} phút | ⭐{p.XepHang}/5 | {(p.DangChieu ? "Đang chiếu" : "Sắp chiếu")}");

            return "Kết quả lọc phim:\n" + string.Join("\n", lines);
        }

        /// <summary>Dispatch: nhận tên hàm + args từ AI, gọi đúng hàm và trả về kết quả</summary>
        public async Task<string> ExecuteAsync(string functionName, Dictionary<string, string> args)
        {
            return functionName switch
            {
                "get_dang_chieu"     => await GetDangChieuAsync(),
                "get_sap_chieu"      => await GetSapChieuAsync(),
                "get_lich_chieu"     => await GetLichChieuAsync(args.GetValueOrDefault("ten_phim", "")),
                "get_thong_tin_phim" => await GetThongTinPhimAsync(args.GetValueOrDefault("ten_phim", "")),
                "get_danh_sach_rap"  => await GetDanhSachRapAsync(),
                "get_khuyen_mai"     => await GetKhuyenMaiAsync(),
                "get_ghe_trong"      => await GetGheTrongAsync(args.GetValueOrDefault("ten_phim", "")),
                "get_gia_ve"         => await GetGiaVeAsync(args.GetValueOrDefault("ten_phim", "")),
                "loc_phim"           => await LocPhimAsync(
                                            args.GetValueOrDefault("the_loai"),
                                            args.GetValueOrDefault("trang_thai"),
                                            args.GetValueOrDefault("xep_hang_toi_thieu")),
                _                    => $"Hàm '{functionName}' không tồn tại."
            };
        }

        /// <summary>Định nghĩa tools gửi cho Gemini (schema khai báo các hàm)</summary>
        public static object GetToolDeclarations() => new[]
        {
            new
            {
                functionDeclarations = new object[]
                {
                    new
                    {
                        name = "get_dang_chieu",
                        description = "Lấy danh sách tất cả phim đang chiếu tại rạp TTA Movie hiện tại."
                    },
                    new
                    {
                        name = "get_sap_chieu",
                        description = "Lấy danh sách phim sắp chiếu (chưa ra mắt) tại rạp TTA Movie."
                    },
                    new
                    {
                        name = "get_lich_chieu",
                        description = "Lấy lịch chiếu (giờ chiếu, rạp, phòng, giá vé) của một bộ phim cụ thể.",
                        parameters = new
                        {
                            type = "object",
                            properties = new
                            {
                                ten_phim = new
                                {
                                    type = "string",
                                    description = "Tên bộ phim cần tra lịch chiếu, ví dụ: 'Lật Mặt', 'Sonic'"
                                }
                            },
                            required = new[] { "ten_phim" }
                        }
                    },
                    new
                    {
                        name = "get_thong_tin_phim",
                        description = "Lấy thông tin chi tiết của một bộ phim: nội dung, đạo diễn, diễn viên, thể loại, thời lượng.",
                        parameters = new
                        {
                            type = "object",
                            properties = new
                            {
                                ten_phim = new
                                {
                                    type = "string",
                                    description = "Tên bộ phim cần xem thông tin"
                                }
                            },
                            required = new[] { "ten_phim" }
                        }
                    },
                    new
                    {
                        name = "get_danh_sach_rap",
                        description = "Lấy danh sách tất cả rạp chiếu phim TTA Movie kèm địa chỉ và hotline."
                    },
                    new
                    {
                        name = "get_khuyen_mai",
                        description = "Lấy danh sách các chương trình khuyến mãi, mã giảm giá đang có hiệu lực."
                    },
                    new
                    {
                        name = "get_ghe_trong",
                        description = "Kiểm tra số ghế trống còn lại của các suất chiếu sắp tới theo tên phim.",
                        parameters = new
                        {
                            type = "object",
                            properties = new
                            {
                                ten_phim = new
                                {
                                    type = "string",
                                    description = "Tên bộ phim cần kiểm tra ghế trống"
                                }
                            },
                            required = new[] { "ten_phim" }
                        }
                    },
                    new
                    {
                        name = "get_gia_ve",
                        description = "Lấy giá vé từng loại ghế (Thường, VIP, Đôi) của một bộ phim.",
                        parameters = new
                        {
                            type = "object",
                            properties = new
                            {
                                ten_phim = new
                                {
                                    type = "string",
                                    description = "Tên bộ phim cần xem giá vé"
                                }
                            },
                            required = new[] { "ten_phim" }
                        }
                    },
                    new
                    {
                        name = "loc_phim",
                        description = "Lọc danh sách phim theo các điều kiện: thể loại, trạng thái chiếu, xếp hạng tối thiểu. Tất cả tham số đều tuỳ chọn.",
                        parameters = new
                        {
                            type = "object",
                            properties = new
                            {
                                the_loai = new
                                {
                                    type = "string",
                                    description = "Thể loại phim cần lọc, ví dụ: 'Hành động', 'Hoạt hình', 'Kinh dị'"
                                },
                                trang_thai = new
                                {
                                    type = "string",
                                    description = "Trạng thái chiếu: 'đang chiếu' hoặc 'sắp chiếu'"
                                },
                                xep_hang_toi_thieu = new
                                {
                                    type = "string",
                                    description = "Xếp hạng tối thiểu từ 0 đến 5, ví dụ: '4' để lọc phim từ 4 sao trở lên"
                                }
                            }
                        }
                    }
                }
            }
        };
    }
}

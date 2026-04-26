using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MovieBooking.Application.DTOs.Booking;
using MovieBooking.Application.Interfaces;
using MovieBooking.Domain.Entities;
using MovieBooking.Domain.Enums;
using MovieBooking.Infrastructure.Data;

namespace MovieBooking.Infrastructure.Services
{
    public class BookingService : IBookingService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly MovieBookingDbContext _context;

        public BookingService(IUnitOfWork unitOfWork, IMapper mapper, MovieBookingDbContext context)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _context = context;
        }

        public async Task<(bool Success, string Message, BookingResponseDto? Booking)> CreateBookingAsync(BookingRequestDto bookingRequest)
        {
            // Kiểm tra lịch chiếu
            var lichChieu = await _context.LichChieus
                .Include(l => l.Phim)
                .Include(l => l.PhongChieu)
                    .ThenInclude(p => p.Rap)
                .FirstOrDefaultAsync(l => l.Id == bookingRequest.LichChieuId);

            if (lichChieu == null)
                return (false, "Lịch chiếu không tồn tại", null);

            if (lichChieu.GioBatDau <= DateTime.Now)
                return (false, "Lịch chiếu đã bắt đầu hoặc đã qua", null);

            if (lichChieu.GioKetThuc <= lichChieu.GioBatDau)
                return (false, "Lịch chiếu có thời gian không hợp lệ", null);

            // Kiểm tra ghế đã được đặt chưa
            var bookedGheIds = await _context.Ves
                .Where(v => v.DonDatVe.LichChieuId == bookingRequest.LichChieuId &&
                           v.DonDatVe.TrangThai != BookingStatus.Cancelled.ToString() &&
                           bookingRequest.GheIds.Contains(v.GheId))
                .Select(v => v.GheId)
                .ToListAsync();

            if (bookedGheIds.Any())
                return (false, $"Ghế {string.Join(", ", bookedGheIds)} đã được đặt", null);

            // Lấy thông tin ghế
            var ghes = await _context.Ghes
                .Where(g => bookingRequest.GheIds.Contains(g.Id))
                .ToListAsync();

            if (ghes.Count != bookingRequest.GheIds.Count)
                return (false, "Một số ghế không tồn tại", null);

            // Kiểm tra không để trống ghế lẻ ở giữa
            var allGhesInRoom = await _context.Ghes
                .Where(g => g.PhongChieuId == lichChieu.PhongChieuId)
                .ToListAsync();

            var bookedInShow = await _context.Ves
                .Where(v => v.DonDatVe.LichChieuId == bookingRequest.LichChieuId &&
                            v.DonDatVe.TrangThai != BookingStatus.Cancelled.ToString())
                .Select(v => v.GheId)
                .ToListAsync();

            // Tập ghế "sẽ bị chiếm" sau khi đặt = đã bán + đang đặt
            var occupiedAfter = new HashSet<int>(bookedInShow.Concat(bookingRequest.GheIds));

            var byRow = allGhesInRoom
                .GroupBy(g => g.SoGhe.Length > 0 ? g.SoGhe[0] : '?');

            foreach (var row in byRow)
            {
                var sorted = row.OrderBy(g =>
                {
                    int.TryParse(g.SoGhe.Substring(1), out int n);
                    return n;
                }).ToList();

                for (int i = 1; i < sorted.Count - 1; i++)
                {
                    var prev = sorted[i - 1];
                    var curr = sorted[i];
                    var next = sorted[i + 1];

                    int.TryParse(prev.SoGhe.Substring(1), out int pn);
                    int.TryParse(curr.SoGhe.Substring(1), out int cn);
                    int.TryParse(next.SoGhe.Substring(1), out int nn);

                    if (cn != pn + 1 || cn != nn - 1) continue;

                    // Chỉ báo lỗi khi curr trống kẹp giữa 2 ghế đang được CHỌN trong đơn này
                    // Ghế đã bán không tính — user không thể chọn nên không phải lỗi của họ
                    bool currEmpty    = !bookingRequest.GheIds.Contains(curr.Id) && !bookedInShow.Contains(curr.Id);
                    bool prevOccupied = bookingRequest.GheIds.Contains(prev.Id);
                    bool nextOccupied = bookingRequest.GheIds.Contains(next.Id);

                    if (currEmpty && prevOccupied && nextOccupied)
                        return (false, $"Không được để trống ghế {curr.SoGhe} ở giữa. Vui lòng chọn ghế liền kề.", null);
                }
            }

            // Tạo đơn đặt vé với transaction để đảm bảo consistency
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Tính tổng tiền và tạo vé
                decimal tongTien = 0;
                var vesChiTiet = new List<Ve>();
                foreach (var ghe in ghes)
                {
                    decimal giaVe = lichChieu.GiaCoBan;
                    if (ghe.LoaiGhe == SeatType.VIP.ToString())
                        giaVe *= 1.5m;
                    tongTien += giaVe;
                    vesChiTiet.Add(new Ve { GheId = ghe.Id, GiaVe = giaVe });
                }

                var donDatVe = new DonDatVe
                {
                    NguoiDungId = bookingRequest.NguoiDungId,
                    LichChieuId = bookingRequest.LichChieuId,
                    TongTien    = tongTien,
                    TrangThai   = BookingStatus.Pending.ToString(),
                    Ves         = vesChiTiet
                };

                await _unitOfWork.DonDatVes.AddAsync(donDatVe);
                await _unitOfWork.SaveChangesAsync();

                // Tăng lượt sử dụng mã khuyến mãi nếu có
                if (!string.IsNullOrWhiteSpace(bookingRequest.MaKhuyenMai))
                {
                    var km = await _context.KhuyenMais
                        .FirstOrDefaultAsync(k => k.MaKhuyenMai.ToLower() == bookingRequest.MaKhuyenMai.ToLower());
                    if (km != null)
                    {
                        km.SoLuotDaDung++;
                        await _context.SaveChangesAsync();
                    }
                }

                await transaction.CommitAsync();

                var bookingResponse = await GetBookingByIdAsync(donDatVe.Id);
                return (true, "Đặt vé thành công", bookingResponse);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return (false, $"Lỗi khi tạo đơn đặt vé: {ex.Message}", null);
            }
        }

        public async Task<IEnumerable<BookingResponseDto>> GetAllBookingsAsync()
        {
            var donDatVes = await _context.DonDatVes
                .Include(d => d.LichChieu)
                    .ThenInclude(l => l.Phim)
                .Include(d => d.LichChieu)
                    .ThenInclude(l => l.PhongChieu)
                        .ThenInclude(p => p.Rap)
                .Include(d => d.Ves)
                    .ThenInclude(v => v.Ghe)
                .OrderByDescending(d => d.NgayTao)
                .ToListAsync();

            return _mapper.Map<IEnumerable<BookingResponseDto>>(donDatVes);
        }

        public async Task<IEnumerable<BookingResponseDto>> GetBookingsByUserIdAsync(int userId)
        {
            var donDatVes = await _context.DonDatVes
                .Include(d => d.LichChieu)
                    .ThenInclude(l => l.Phim)
                .Include(d => d.LichChieu)
                    .ThenInclude(l => l.PhongChieu)
                        .ThenInclude(p => p.Rap)
                .Include(d => d.Ves)
                    .ThenInclude(v => v.Ghe)
                .Where(d => d.NguoiDungId == userId)
                .OrderByDescending(d => d.NgayTao)
                .ToListAsync();

            return _mapper.Map<IEnumerable<BookingResponseDto>>(donDatVes);
        }

        public async Task<BookingResponseDto?> GetBookingByIdAsync(int id)
        {
            var donDatVe = await _context.DonDatVes
                .Include(d => d.LichChieu)
                    .ThenInclude(l => l.Phim)
                .Include(d => d.LichChieu)
                    .ThenInclude(l => l.PhongChieu)
                        .ThenInclude(p => p.Rap)
                .Include(d => d.Ves)
                    .ThenInclude(v => v.Ghe)
                .FirstOrDefaultAsync(d => d.Id == id);

            return donDatVe == null ? null : _mapper.Map<BookingResponseDto>(donDatVe);
        }

        public async Task<bool> CancelBookingAsync(int id)
        {
            var donDatVe = await _unitOfWork.DonDatVes.GetByIdAsync(id);
            if (donDatVe == null) return false;

            // Chỉ cho phép hủy đơn nếu nó đang ở trạng thái Pending
            if (donDatVe.TrangThai == BookingStatus.Paid.ToString() || 
                donDatVe.TrangThai == BookingStatus.Cancelled.ToString() ||
                donDatVe.TrangThai == BookingStatus.Refunded.ToString())
                return false;

            donDatVe.TrangThai = BookingStatus.Cancelled.ToString();
            donDatVe.NgayCapNhat = DateTime.UtcNow;

            _unitOfWork.DonDatVes.Update(donDatVe);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<(bool Success, string Message)> UpdateBookingStatusAsync(int id, string newStatus)
        {
            var donDatVe = await _unitOfWork.DonDatVes.GetByIdAsync(id);
            if (donDatVe == null)
                return (false, "Đơn đặt vé không tồn tại");

            if (string.IsNullOrWhiteSpace(newStatus))
                return (false, "Trạng thái mới không được để trống");

            if (!Enum.TryParse<BookingStatus>(newStatus, true, out var parsedStatus))
                return (false, "Trạng thái không hợp lệ");

            var currentStatus = donDatVe.TrangThai;
            if (currentStatus == parsedStatus.ToString())
                return (false, "Đơn đặt vé đã ở trạng thái này");

            bool isValidTransition = currentStatus switch
            {
                var s when s == BookingStatus.Pending.ToString() => parsedStatus == BookingStatus.Paid || parsedStatus == BookingStatus.Cancelled,
                var s when s == BookingStatus.Paid.ToString() => parsedStatus == BookingStatus.Refunded,
                var s when s == BookingStatus.Cancelled.ToString() => false,
                var s when s == BookingStatus.Refunded.ToString() => false,
                _ => false
            };

            if (!isValidTransition)
            {
                return (false, "Không thể chuyển trạng thái này. Chỉ cho phép Pending → Paid / Cancelled, Paid → Refunded.");
            }

            donDatVe.TrangThai = parsedStatus.ToString();
            donDatVe.NgayCapNhat = DateTime.UtcNow;
            _unitOfWork.DonDatVes.Update(donDatVe);
            await _unitOfWork.SaveChangesAsync();
            return (true, "Cập nhật trạng thái đơn đặt vé thành công");
        }
    }
}

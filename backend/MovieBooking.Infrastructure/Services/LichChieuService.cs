using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MovieBooking.Application.DTOs.Cinema;
using MovieBooking.Application.DTOs.Showtime;
using MovieBooking.Application.Interfaces;
using MovieBooking.Domain.Entities;
using MovieBooking.Domain.Enums;
using MovieBooking.Infrastructure.Data;

namespace MovieBooking.Infrastructure.Services
{
    public class LichChieuService : ILichChieuService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly MovieBookingDbContext _context;

        public LichChieuService(IUnitOfWork unitOfWork, IMapper mapper, MovieBookingDbContext context)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _context = context;
        }

        public async Task<IEnumerable<LichChieuDto>> GetLichChieuByPhimIdAsync(int phimId)
        {
            var lichChieus = await _context.LichChieus
                .Include(l => l.Phim)
                .Include(l => l.PhongChieu)
                    .ThenInclude(p => p.Rap)
                .Where(l => l.PhimId == phimId)
                .OrderByDescending(l => l.Id)
                .ToListAsync();

            return _mapper.Map<IEnumerable<LichChieuDto>>(lichChieus);
        }

        public async Task<IEnumerable<LichChieuDto>> GetLichChieuByPhongChieuIdAsync(int phongChieuId)
        {
            var lichChieus = await _context.LichChieus
                .Include(l => l.Phim)
                .Include(l => l.PhongChieu)
                    .ThenInclude(p => p.Rap)
                .Where(l => l.PhongChieuId == phongChieuId)
                .OrderByDescending(l => l.Id)
                .ToListAsync();

            return _mapper.Map<IEnumerable<LichChieuDto>>(lichChieus);
        }

        public async Task<IEnumerable<LichChieuDto>> GetLichChieuByRapIdAsync(int rapId)
        {
            var lichChieus = await _context.LichChieus
                .Include(l => l.Phim)
                .Include(l => l.PhongChieu)
                    .ThenInclude(p => p.Rap)
                .Where(l => l.PhongChieu.RapId == rapId)
                .OrderByDescending(l => l.Id)
                .ToListAsync();

            return _mapper.Map<IEnumerable<LichChieuDto>>(lichChieus);
        }

        public async Task<LichChieuDto?> GetLichChieuByIdAsync(int id)
        {
            var lichChieu = await _context.LichChieus
                .Include(l => l.Phim)
                .Include(l => l.PhongChieu)
                    .ThenInclude(p => p.Rap)
                .FirstOrDefaultAsync(l => l.Id == id);

            return lichChieu == null ? null : _mapper.Map<LichChieuDto>(lichChieu);
        }

        public async Task<IEnumerable<GheDto>> GetGhesByLichChieuIdAsync(int lichChieuId)
        {
            var lichChieu = await _context.LichChieus
                .Include(l => l.PhongChieu)
                    .ThenInclude(p => p.Ghes)
                .FirstOrDefaultAsync(l => l.Id == lichChieuId);

            if (lichChieu == null) return Enumerable.Empty<GheDto>();

            var bookedGheIds = await _context.Ves
                .Where(v => v.DonDatVe.LichChieuId == lichChieuId && 
                           v.DonDatVe.TrangThai != BookingStatus.Cancelled.ToString())
                .Select(v => v.GheId)
                .ToListAsync();

            var gheDtos = _mapper.Map<IEnumerable<GheDto>>(lichChieu.PhongChieu.Ghes);
            
            foreach (var ghe in gheDtos)
            {
                ghe.DaDat = bookedGheIds.Contains(ghe.Id);
            }

            return gheDtos;
        }

        public async Task<LichChieuDto> CreateLichChieuAsync(CreateLichChieuDto createLichChieuDto)
        {
            var phim = await _context.Phims.FindAsync(createLichChieuDto.PhimId);
            if (phim == null)
                throw new InvalidOperationException("Phim không tồn tại trên hệ thống.");

            var phongChieu = await _context.PhongChieus.FindAsync(createLichChieuDto.PhongChieuId);
            if (phongChieu == null)
                throw new InvalidOperationException("Phòng chiếu không tồn tại trên hệ thống.");

            if (createLichChieuDto.GioKetThuc < createLichChieuDto.GioBatDau.AddMinutes(phim.ThoiLuong))
                throw new InvalidOperationException($"Giờ kết thúc không hợp lệ. Phim có thời lượng {phim.ThoiLuong} phút.");

            // Kiểm tra trùng lịch trong cùng phòng chiếu
            bool trung = await _context.LichChieus.AnyAsync(l =>
                l.PhongChieuId == createLichChieuDto.PhongChieuId &&
                l.GioBatDau < createLichChieuDto.GioKetThuc &&
                l.GioKetThuc > createLichChieuDto.GioBatDau);

            if (trung)
                throw new InvalidOperationException("Phòng chiếu đã có lịch chiếu trong thời gian này.");

            var lichChieu = _mapper.Map<LichChieu>(createLichChieuDto);
            await _unitOfWork.LichChieus.AddAsync(lichChieu);
            await _unitOfWork.SaveChangesAsync();

            return (await GetLichChieuByIdAsync(lichChieu.Id))!;
        }

        public async Task<LichChieuDto?> UpdateLichChieuAsync(int id, CreateLichChieuDto dto)
        {
            var lichChieu = await _unitOfWork.LichChieus.GetByIdAsync(id);
            if (lichChieu == null) return null;

            var phim = await _context.Phims.FindAsync(dto.PhimId);
            if (phim == null)
                throw new InvalidOperationException("Phim không tồn tại trên hệ thống.");

            var phongChieu = await _context.PhongChieus.FindAsync(dto.PhongChieuId);
            if (phongChieu == null)
                throw new InvalidOperationException("Phòng chiếu không tồn tại trên hệ thống.");

            if (dto.GioKetThuc < dto.GioBatDau.AddMinutes(phim.ThoiLuong))
                throw new InvalidOperationException($"Giờ kết thúc không hợp lệ. Phim có thời lượng {phim.ThoiLuong} phút.");

            // Không cho sửa nếu đã có vé được đặt
            bool coVe = await _context.Ves
                .AnyAsync(v => v.DonDatVe.LichChieuId == id &&
                               v.DonDatVe.TrangThai != "Cancelled");
            if (coVe)
                throw new InvalidOperationException("Không thể sửa lịch chiếu này vì đã có vé được đặt.");

            // Kiểm tra trùng lịch (bỏ qua chính nó)
            bool trung = await _context.LichChieus.AnyAsync(l =>
                l.Id != id &&
                l.PhongChieuId == dto.PhongChieuId &&
                l.GioBatDau < dto.GioKetThuc &&
                l.GioKetThuc > dto.GioBatDau);

            if (trung)
                throw new InvalidOperationException("Phòng chiếu đã có lịch chiếu trong thời gian này.");

            lichChieu.GioBatDau    = dto.GioBatDau;
            lichChieu.GioKetThuc   = dto.GioKetThuc;
            lichChieu.GiaCoBan     = dto.GiaCoBan;
            lichChieu.PhimId       = dto.PhimId;
            lichChieu.PhongChieuId = dto.PhongChieuId;
            lichChieu.NgayCapNhat  = DateTime.Now;

            _unitOfWork.LichChieus.Update(lichChieu);
            await _unitOfWork.SaveChangesAsync();

            return await GetLichChieuByIdAsync(id);
        }

        public async Task<(bool Success, string Message)> DeleteLichChieuAsync(int id)
        {
            var lichChieu = await _unitOfWork.LichChieus.GetByIdAsync(id);
            if (lichChieu == null) return (false, "Lịch chiếu không tồn tại");

            bool coVe = await _context.Ves
                .AnyAsync(v => v.DonDatVe.LichChieuId == id &&
                               v.DonDatVe.TrangThai != "Cancelled");
            if (coVe)
                return (false, "Không thể xóa lịch chiếu này vì đã có vé được đặt.");

            _unitOfWork.LichChieus.Delete(lichChieu);
            await _unitOfWork.SaveChangesAsync();
            return (true, "Xóa lịch chiếu thành công");
        }
    }
}

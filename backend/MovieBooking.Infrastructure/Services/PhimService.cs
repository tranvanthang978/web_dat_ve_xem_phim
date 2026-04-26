using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MovieBooking.Application.DTOs.Movie;
using MovieBooking.Application.Interfaces;
using MovieBooking.Domain.Entities;
using MovieBooking.Infrastructure.Data;

namespace MovieBooking.Infrastructure.Services
{
    public class PhimService : IPhimService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly MovieBookingDbContext _context;

        public PhimService(IUnitOfWork unitOfWork, IMapper mapper, MovieBookingDbContext context)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _context = context;
        }

        public async Task<IEnumerable<PhimDto>> GetAllPhimsAsync()
        {
            var phims = await _context.Phims.OrderByDescending(p => p.Id).ToListAsync();
            return _mapper.Map<IEnumerable<PhimDto>>(phims);
        }

        public async Task<PhimDto?> GetPhimByIdAsync(int id)
        {
            var phim = await _unitOfWork.Phims.GetByIdAsync(id);
            return phim == null ? null : _mapper.Map<PhimDto>(phim);
        }

        public async Task<IEnumerable<PhimDto>> GetPhimsDangChieuAsync()
        {
            var phims = await _context.Phims.Where(p => p.DangChieu).OrderByDescending(p => p.Id).ToListAsync();
            return _mapper.Map<IEnumerable<PhimDto>>(phims);
        }

        public async Task<PhimDto> CreatePhimAsync(CreatePhimDto createPhimDto)
        {
            if (await _context.Phims.AnyAsync(p => p.TenPhim.ToLower() == createPhimDto.TenPhim.ToLower()))
                throw new InvalidOperationException("Phim với tên này đã tồn tại trên hệ thống.");

            var phim = _mapper.Map<Phim>(createPhimDto);
            await _unitOfWork.Phims.AddAsync(phim);
            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<PhimDto>(phim);
        }

        public async Task<bool> UpdatePhimAsync(int id, CreatePhimDto updatePhimDto)
        {
            var phim = await _unitOfWork.Phims.GetByIdAsync(id);
            if (phim == null) return false;

            if (await _context.Phims.AnyAsync(p => p.TenPhim.ToLower() == updatePhimDto.TenPhim.ToLower() && p.Id != id))
                throw new InvalidOperationException("Phim với tên này đã tồn tại trên hệ thống.");

            phim.TenPhim    = updatePhimDto.TenPhim;
            phim.MoTa       = updatePhimDto.MoTa;
            phim.TrailerUrl = updatePhimDto.TrailerUrl;
            phim.PosterUrl  = updatePhimDto.PosterUrl;
            phim.BackdropUrl = updatePhimDto.BackdropUrl;
            phim.TheLoai    = updatePhimDto.TheLoai;
            phim.XepHang    = updatePhimDto.XepHang;
            phim.DaoDien    = updatePhimDto.DaoDien;
            phim.DienVien   = updatePhimDto.DienVien;
            phim.ThoiLuong  = updatePhimDto.ThoiLuong;
            phim.DangChieu  = updatePhimDto.DangChieu;
            phim.NgayCapNhat = DateTime.Now;

            _unitOfWork.Phims.Update(phim);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<(bool Success, string Message)> DeletePhimAsync(int id)
        {
            var phim = await _unitOfWork.Phims.GetByIdAsync(id);
            if (phim == null) return (false, "Phim không tồn tại");

            // Kiểm tra có lịch chiếu không
            bool coLichChieu = await _context.LichChieus.AnyAsync(l => l.PhimId == id);
            if (coLichChieu)
                return (false, "Không thể xóa phim này vì đang có lịch chiếu.");

            // Kiểm tra đã phát sinh vé chưa
            bool coVe = await _context.Ves
                .AnyAsync(v => v.DonDatVe.LichChieu.PhimId == id);
            if (coVe)
                return (false, "Không thể xóa phim này vì đã có vé được đặt.");

            _unitOfWork.Phims.Delete(phim);
            await _unitOfWork.SaveChangesAsync();
            return (true, "Xóa phim thành công");
        }
    }
}

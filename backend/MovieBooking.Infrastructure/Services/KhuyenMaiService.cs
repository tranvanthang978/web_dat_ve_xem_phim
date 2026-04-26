using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MovieBooking.Application.DTOs.Promotion;
using MovieBooking.Application.Interfaces;
using MovieBooking.Domain.Entities;
using MovieBooking.Infrastructure.Data;

namespace MovieBooking.Infrastructure.Services
{
    public class KhuyenMaiService : IKhuyenMaiService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly MovieBookingDbContext _context;

        public KhuyenMaiService(IUnitOfWork unitOfWork, IMapper mapper, MovieBookingDbContext context)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _context = context;
        }

        public async Task<IEnumerable<KhuyenMaiDto>> GetAllKhuyenMaiAsync()
        {
            var now = DateTime.UtcNow;
            var khuyenMais = await _context.KhuyenMais.OrderBy(k => k.MaKhuyenMai).ToListAsync();

            // Tự động cập nhật ConHieuLuc theo thời gian thực
            bool changed = false;
            foreach (var k in khuyenMais)
            {
                bool shouldBeActive = k.NgayBatDau <= now && k.NgayKetThuc >= now
                    && (k.SoLuotSuDung == 0 || k.SoLuotDaDung < k.SoLuotSuDung);
                if (k.ConHieuLuc != shouldBeActive)
                {
                    k.ConHieuLuc = shouldBeActive;
                    changed = true;
                }
            }
            if (changed) await _context.SaveChangesAsync();

            return _mapper.Map<IEnumerable<KhuyenMaiDto>>(khuyenMais);
        }

        public async Task<KhuyenMaiDto?> GetKhuyenMaiByIdAsync(int id)
        {
            var khuyenMai = await _context.KhuyenMais.FirstOrDefaultAsync(k => k.Id == id);
            return khuyenMai == null ? null : _mapper.Map<KhuyenMaiDto>(khuyenMai);
        }

        public async Task<KhuyenMaiDto?> ValidateMaKhuyenMaiAsync(string ma)
        {
            var now = DateTime.UtcNow;
            var km = await _context.KhuyenMais.FirstOrDefaultAsync(k =>
                k.MaKhuyenMai.ToLower() == ma.ToLower() &&
                k.ConHieuLuc &&
                k.NgayBatDau <= now &&
                k.NgayKetThuc >= now &&
                (k.SoLuotSuDung == 0 || k.SoLuotDaDung < k.SoLuotSuDung));

            return km == null ? null : _mapper.Map<KhuyenMaiDto>(km);
        }

        public async Task<KhuyenMaiDto> CreateKhuyenMaiAsync(CreateKhuyenMaiDto createKhuyenMaiDto)
        {
            if (createKhuyenMaiDto.NgayBatDau >= createKhuyenMaiDto.NgayKetThuc)
                throw new InvalidOperationException("Ngày bắt đầu phải nhỏ hơn ngày kết thúc.");

            if (createKhuyenMaiDto.GiaTriGiam <= 0 || createKhuyenMaiDto.GiaTriGiam > 100)
                throw new InvalidOperationException("Giá trị giảm (phần trăm) phải lớn hơn 0 và không vượt quá 100.");

            bool trung = await _context.KhuyenMais
                .AnyAsync(k => k.MaKhuyenMai.ToLower() == createKhuyenMaiDto.MaKhuyenMai.ToLower());
            if (trung)
                throw new InvalidOperationException($"Mã khuyến mãi '{createKhuyenMaiDto.MaKhuyenMai}' đã tồn tại.");

            var khuyenMai = _mapper.Map<KhuyenMai>(createKhuyenMaiDto);
            khuyenMai.ConHieuLuc = DateTime.Now < khuyenMai.NgayKetThuc;
            await _unitOfWork.KhuyenMais.AddAsync(khuyenMai);
            await _unitOfWork.SaveChangesAsync();

            return (await GetKhuyenMaiByIdAsync(khuyenMai.Id))!;
        }

        public async Task<KhuyenMaiDto?> UpdateKhuyenMaiAsync(int id, UpdateKhuyenMaiDto updateKhuyenMaiDto)
        {
            var khuyenMai = await _unitOfWork.KhuyenMais.GetByIdAsync(id);
            if (khuyenMai == null) return null;

            if (updateKhuyenMaiDto.NgayBatDau >= updateKhuyenMaiDto.NgayKetThuc)
                throw new InvalidOperationException("Ngày bắt đầu phải nhỏ hơn ngày kết thúc.");

            if (updateKhuyenMaiDto.GiaTriGiam <= 0 || updateKhuyenMaiDto.GiaTriGiam > 100)
                throw new InvalidOperationException("Giá trị giảm (phần trăm) phải lớn hơn 0 và không vượt quá 100.");

            // Kiểm tra trùng mã (bỏ qua chính nó)
            bool trung = await _context.KhuyenMais
                .AnyAsync(k => k.Id != id && k.MaKhuyenMai.ToLower() == updateKhuyenMaiDto.MaKhuyenMai.ToLower());
            if (trung)
                throw new InvalidOperationException($"Mã khuyến mãi '{updateKhuyenMaiDto.MaKhuyenMai}' đã tồn tại.");

            khuyenMai.MaKhuyenMai = updateKhuyenMaiDto.MaKhuyenMai;
            khuyenMai.GiaTriGiam  = updateKhuyenMaiDto.GiaTriGiam;
            khuyenMai.NgayBatDau  = updateKhuyenMaiDto.NgayBatDau;
            khuyenMai.NgayKetThuc = updateKhuyenMaiDto.NgayKetThuc;
            khuyenMai.ConHieuLuc  = updateKhuyenMaiDto.ConHieuLuc;
            khuyenMai.SoLuotSuDung = updateKhuyenMaiDto.SoLuotSuDung;
            khuyenMai.GiamToiDa   = updateKhuyenMaiDto.GiamToiDa;

            _unitOfWork.KhuyenMais.Update(khuyenMai);
            await _unitOfWork.SaveChangesAsync();

            return await GetKhuyenMaiByIdAsync(id);
        }

        public async Task<bool> DeleteKhuyenMaiAsync(int id)
        {
            var khuyenMai = await _unitOfWork.KhuyenMais.GetByIdAsync(id);
            if (khuyenMai == null) return false;

            _unitOfWork.KhuyenMais.Delete(khuyenMai);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}

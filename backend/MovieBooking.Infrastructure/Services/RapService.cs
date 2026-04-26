using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MovieBooking.Application.DTOs.Cinema;
using MovieBooking.Application.Interfaces;
using MovieBooking.Domain.Entities;
using MovieBooking.Infrastructure.Data;

namespace MovieBooking.Infrastructure.Services
{
    public class RapService : IRapService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly MovieBookingDbContext _context;

        public RapService(IUnitOfWork unitOfWork, IMapper mapper, MovieBookingDbContext context)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _context = context;
        }


        public async Task<IEnumerable<RapDto>> GetAllRapsAsync()
        {
            var raps = await _unitOfWork.Raps.GetAllAsync();
            return _mapper.Map<IEnumerable<RapDto>>(raps);
        }

        public async Task<RapDto?> GetRapByIdAsync(int id)
        {
            var rap = await _unitOfWork.Raps.GetByIdAsync(id);
            return rap == null ? null : _mapper.Map<RapDto>(rap);
        }

        public async Task<RapDto> CreateRapAsync(CreateRapDto dto)
        {
            if (await _context.Raps.AnyAsync(r => r.TenRap.ToLower() == dto.TenRap.ToLower()))
                throw new InvalidOperationException("Rạp chiếu với tên này đã tồn tại.");

            var rap = _mapper.Map<Rap>(dto);
            await _unitOfWork.Raps.AddAsync(rap);
            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<RapDto>(rap);
        }

        public async Task<RapDto?> UpdateRapAsync(int id, UpdateRapDto dto)
        {
            var rap = await _unitOfWork.Raps.GetByIdAsync(id);
            if (rap == null) return null;

            if (await _context.Raps.AnyAsync(r => r.TenRap.ToLower() == dto.TenRap.ToLower() && r.Id != id))
                throw new InvalidOperationException("Rạp chiếu với tên này đã tồn tại.");

            rap.TenRap = dto.TenRap;
            rap.DiaChi = dto.DiaChi;
            rap.Hotline = dto.Hotline;
            rap.NgayCapNhat = DateTime.Now;

            _unitOfWork.Raps.Update(rap);
            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<RapDto>(rap);
        }

        public async Task<bool> DeleteRapAsync(int id)
        {
            var rap = await _unitOfWork.Raps.GetByIdAsync(id);
            if (rap == null) return false;

            if (await _context.PhongChieus.AnyAsync(p => p.RapId == id))
                throw new InvalidOperationException("Không thể xóa rạp này vì đang có phòng chiếu.");

            _unitOfWork.Raps.Delete(rap);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }


        public async Task<IEnumerable<PhongChieuDto>> GetPhongChieusByRapIdAsync(int rapId)
        {
            var phongChieus = await _context.PhongChieus
                .Include(p => p.Rap)
                .Include(p => p.Ghes)
                .Where(p => p.RapId == rapId)
                .ToListAsync();

            return _mapper.Map<IEnumerable<PhongChieuDto>>(phongChieus);
        }

        public async Task<PhongChieuDto?> GetPhongChieuByIdAsync(int id)
        {
            var phongChieu = await _context.PhongChieus
                .Include(p => p.Rap)
                .Include(p => p.Ghes)
                .FirstOrDefaultAsync(p => p.Id == id);

            return phongChieu == null ? null : _mapper.Map<PhongChieuDto>(phongChieu);
        }

        public async Task<PhongChieuDto> CreatePhongChieuAsync(CreatePhongChieuDto dto)
        {
            var rapExist = await _context.Raps.AnyAsync(r => r.Id == dto.RapId);
            if (!rapExist)
                throw new InvalidOperationException("Rạp chiếu không tồn tại.");

            if (await _context.PhongChieus.AnyAsync(p => p.RapId == dto.RapId && p.TenPhong.ToLower() == dto.TenPhong.ToLower()))
                throw new InvalidOperationException("Tên phòng chiếu đã tồn tại trong rạp này.");

            var phongChieu = new PhongChieu
            {
                TenPhong = dto.TenPhong,
                RapId = dto.RapId,
                Ghes = new List<Ghe>()
            };

            // Tự động tạo ghế theo hàng và số ghế mỗi hàng
            // Hàng: A, B, C, ... | Ghế: 1, 2, 3, ...
            for (int hang = 0; hang < dto.SoHangGhe; hang++)
            {
                char tenHang = (char)('A' + hang);
                for (int soThu = 1; soThu <= dto.SoGheMotHang; soThu++)
                {
                    // Hàng cuối là VIP, còn lại là Thường
                    string loaiGhe = (hang == dto.SoHangGhe - 1) ? "VIP" : "Thuong";
                    phongChieu.Ghes.Add(new Ghe
                    {
                        SoGhe = $"{tenHang}{soThu}",
                        LoaiGhe = loaiGhe,
                    });
                }
            }

            await _context.PhongChieus.AddAsync(phongChieu);
            await _context.SaveChangesAsync();

            // Load lại với Rap để map TenRap
            await _context.Entry(phongChieu).Reference(p => p.Rap).LoadAsync();
            return _mapper.Map<PhongChieuDto>(phongChieu);
        }

        public async Task<PhongChieuDto?> UpdatePhongChieuAsync(int id, UpdatePhongChieuDto dto)
        {
            var phongChieu = await _context.PhongChieus
                .Include(p => p.Rap)
                .Include(p => p.Ghes)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (phongChieu == null) return null;

            if (await _context.PhongChieus.AnyAsync(p => p.RapId == phongChieu.RapId && p.TenPhong.ToLower() == dto.TenPhong.ToLower() && p.Id != id))
                throw new InvalidOperationException("Tên phòng chiếu đã tồn tại trong rạp này.");

            phongChieu.TenPhong = dto.TenPhong;
            phongChieu.NgayCapNhat = DateTime.Now;

            // Cập nhật ghế nếu cấu hình thay đổi
            if (dto.SoHangGhe > 0 && dto.SoGheMotHang > 0)
            {
                // Kiểm tra có vé đã đặt không
                var gheIds = phongChieu.Ghes.Select(g => g.Id).ToList();
                bool coVeDaDat = gheIds.Any() && await _context.Ves.AnyAsync(v => gheIds.Contains(v.GheId));
                if (coVeDaDat)
                    throw new InvalidOperationException("Không thể thay đổi cấu hình ghế vì đã có vé được đặt trong phòng này.");

                // Xóa ghế cũ
                _context.Ghes.RemoveRange(phongChieu.Ghes);

                // Tạo ghế mới
                var gheMoi = new List<Ghe>();
                for (int hang = 0; hang < dto.SoHangGhe; hang++)
                {
                    char tenHang = (char)('A' + hang);
                    for (int soThu = 1; soThu <= dto.SoGheMotHang; soThu++)
                    {
                        string loaiGhe = (hang == dto.SoHangGhe - 1) ? "VIP" : "Thuong";
                        gheMoi.Add(new Ghe
                        {
                            SoGhe = $"{tenHang}{soThu}",
                            LoaiGhe = loaiGhe,
                            PhongChieuId = id
                        });
                    }
                }
                await _context.Ghes.AddRangeAsync(gheMoi);
            }

            await _context.SaveChangesAsync();
            return _mapper.Map<PhongChieuDto>(phongChieu);
        }

        public async Task<(bool Success, string Message)> DeletePhongChieuAsync(int id)
        {
            var phongChieu = await _unitOfWork.PhongChieus.GetByIdAsync(id);
            if (phongChieu == null) return (false, "Phòng chiếu không tồn tại");

            bool coLichChieu = await _context.LichChieus.AnyAsync(l => l.PhongChieuId == id);
            if (coLichChieu)
                return (false, "Không thể xóa phòng chiếu này vì đang có lịch chiếu.");

            _unitOfWork.PhongChieus.Delete(phongChieu);
            await _unitOfWork.SaveChangesAsync();
            return (true, "Xóa phòng chiếu thành công");
        }


        public async Task<IEnumerable<GheDto>> GetGhesByPhongChieuAsync(int phongChieuId)
        {
            var ghes = await _context.Ghes
                .Where(g => g.PhongChieuId == phongChieuId)
                .OrderBy(g => g.SoGhe)
                .ToListAsync();

            return _mapper.Map<IEnumerable<GheDto>>(ghes);
        }
    }
}

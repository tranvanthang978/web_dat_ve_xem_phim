using AutoMapper;
using MovieBooking.Application.DTOs.User;
using MovieBooking.Application.Interfaces;
using MovieBooking.Domain.Entities;
using MovieBooking.Domain.Enums;

namespace MovieBooking.Infrastructure.Services
{
    public class NguoiDungService : INguoiDungService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IPasswordHasher _passwordHasher;

        public NguoiDungService(IUnitOfWork unitOfWork, IMapper mapper, IPasswordHasher passwordHasher)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _passwordHasher = passwordHasher ?? throw new ArgumentNullException(nameof(passwordHasher));
        }

        public async Task<IEnumerable<NguoiDungDto>> GetAllAsync()
        {
            var users = await _unitOfWork.NguoiDungs.GetAllAsync();
            return _mapper.Map<IEnumerable<NguoiDungDto>>(users);
        }

        public async Task<NguoiDungDto?> GetByIdAsync(int id)
        {
            var user = await _unitOfWork.NguoiDungs.GetByIdAsync(id);
            return user == null ? null : _mapper.Map<NguoiDungDto>(user);
        }

        public async Task<NguoiDungDto?> UpdateAsync(int id, UpdateNguoiDungDto dto)
        {
            var user = await _unitOfWork.NguoiDungs.GetByIdAsync(id);
            if (user == null) return null;

            // Kiểm tra email trùng với người dùng khác
            var existing = await _unitOfWork.NguoiDungs.FirstOrDefaultAsync(u => u.Email == dto.Email && u.Id != id);
            if (existing != null) return null;

            user.HoTen = dto.HoTen;
            user.Email = dto.Email;
            user.SoDienThoai = dto.SoDienThoai;
            user.NgayCapNhat = DateTime.UtcNow;

            _unitOfWork.NguoiDungs.Update(user);
            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<NguoiDungDto>(user);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var user = await _unitOfWork.NguoiDungs.GetByIdAsync(id);
            if (user == null) return false;

            _unitOfWork.NguoiDungs.Delete(user);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<(bool Success, string Message)> ChangePasswordAsync(int id, ChangePasswordDto dto)
        {
            var user = await _unitOfWork.NguoiDungs.GetByIdAsync(id);
            if (user == null) return (false, "Người dùng không tồn tại");

            if (!_passwordHasher.VerifyPassword(dto.MatKhauCu, user.MatKhauHash))
                return (false, "Mật khẩu cũ không đúng");

            user.MatKhauHash = _passwordHasher.HashPassword(dto.MatKhauMoi);
            user.NgayCapNhat = DateTime.UtcNow;

            _unitOfWork.NguoiDungs.Update(user);
            await _unitOfWork.SaveChangesAsync();
            return (true, "Đổi mật khẩu thành công");
        }

        public async Task<bool> UpdateVaiTroAsync(int id, string vaiTro)
        {
            var user = await _unitOfWork.NguoiDungs.GetByIdAsync(id);
            if (user == null) return false;

            user.VaiTro = vaiTro;
            user.NgayCapNhat = DateTime.UtcNow;

            _unitOfWork.NguoiDungs.Update(user);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<(bool Success, string Message, NguoiDungDto? Data)> CreateAdminAsync(string hoTen, string email, string matKhau)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(matKhau))
                return (false, "Email và mật khẩu không được để trống", null);

            var existingUser = await _unitOfWork.NguoiDungs.FirstOrDefaultAsync(u => u.Email == email);
            if (existingUser != null)
                return (false, "Email đã được sử dụng", null);

            var admin = new NguoiDung
            {
                HoTen = string.IsNullOrWhiteSpace(hoTen) ? "Admin" : hoTen,
                Email = email,
                MatKhauHash = _passwordHasher.HashPassword(matKhau),
                VaiTro = UserRole.Admin.ToString()
            };

            await _unitOfWork.NguoiDungs.AddAsync(admin);
            await _unitOfWork.SaveChangesAsync();

            return (true, "Tạo tài khoản Admin thành công", _mapper.Map<NguoiDungDto>(admin));
        }
    }
}


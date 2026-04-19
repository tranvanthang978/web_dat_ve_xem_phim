using MovieBooking.Application.Interfaces;
using MovieBooking.Domain.Entities;
using MovieBooking.Infrastructure.Data;

namespace MovieBooking.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly MovieBookingDbContext _context;

        public UnitOfWork(MovieBookingDbContext context)
        {
            _context = context;
            Phims = new GenericRepository<Phim>(_context);
            Raps = new GenericRepository<Rap>(_context);
            PhongChieus = new GenericRepository<PhongChieu>(_context);
            Ghes = new GenericRepository<Ghe>(_context);
            LichChieus = new GenericRepository<LichChieu>(_context);
            NguoiDungs = new GenericRepository<NguoiDung>(_context);
            DonDatVes = new GenericRepository<DonDatVe>(_context);
            Ves = new GenericRepository<Ve>(_context);
            ThanhToans = new GenericRepository<ThanhToan>(_context);
            KhuyenMais = new GenericRepository<KhuyenMai>(_context);
        }

        public IGenericRepository<Phim> Phims { get; }
        public IGenericRepository<Rap> Raps { get; }
        public IGenericRepository<PhongChieu> PhongChieus { get; }
        public IGenericRepository<Ghe> Ghes { get; }
        public IGenericRepository<LichChieu> LichChieus { get; }
        public IGenericRepository<NguoiDung> NguoiDungs { get; }
        public IGenericRepository<DonDatVe> DonDatVes { get; }
        public IGenericRepository<Ve> Ves { get; }
        public IGenericRepository<ThanhToan> ThanhToans { get; }
        public IGenericRepository<KhuyenMai> KhuyenMais { get; }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}

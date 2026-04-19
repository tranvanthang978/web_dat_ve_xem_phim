using MovieBooking.Domain.Entities;

namespace MovieBooking.Application.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IGenericRepository<Phim> Phims { get; }
        IGenericRepository<Rap> Raps { get; }
        IGenericRepository<PhongChieu> PhongChieus { get; }
        IGenericRepository<Ghe> Ghes { get; }
        IGenericRepository<LichChieu> LichChieus { get; }
        IGenericRepository<NguoiDung> NguoiDungs { get; }
        IGenericRepository<DonDatVe> DonDatVes { get; }
        IGenericRepository<Ve> Ves { get; }
        IGenericRepository<ThanhToan> ThanhToans { get; }
        IGenericRepository<KhuyenMai> KhuyenMais { get; }
        
        Task<int> SaveChangesAsync();
    }
}

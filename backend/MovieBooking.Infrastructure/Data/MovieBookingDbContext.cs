using Microsoft.EntityFrameworkCore;
using MovieBooking.Domain.Entities;

namespace MovieBooking.Infrastructure.Data
{
    public class MovieBookingDbContext : DbContext
    {
        public MovieBookingDbContext(DbContextOptions<MovieBookingDbContext> options)
            : base(options)
        {
        }

        public DbSet<Phim> Phims { get; set; }
        public DbSet<Rap> Raps { get; set; }
        public DbSet<PhongChieu> PhongChieus { get; set; }
        public DbSet<Ghe> Ghes { get; set; }
        public DbSet<LichChieu> LichChieus { get; set; }
        public DbSet<NguoiDung> NguoiDungs { get; set; }
        public DbSet<DonDatVe> DonDatVes { get; set; }
        public DbSet<Ve> Ves { get; set; }
        public DbSet<ThanhToan> ThanhToans { get; set; }
        public DbSet<KhuyenMai> KhuyenMais { get; set; }

        protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
        {
            configurationBuilder.Properties<decimal>()
                .HaveColumnType("decimal(18, 2)");
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Rap -> PhongChieu
            modelBuilder.Entity<PhongChieu>()
                .HasOne(p => p.Rap)
                .WithMany(r => r.PhongChieus)
                .HasForeignKey(p => p.RapId)
                .OnDelete(DeleteBehavior.Cascade);

            // PhongChieu -> Ghe
            modelBuilder.Entity<Ghe>()
                .HasOne(g => g.PhongChieu)
                .WithMany(p => p.Ghes)
                .HasForeignKey(g => g.PhongChieuId)
                .OnDelete(DeleteBehavior.Cascade);

            // PhongChieu -> LichChieu
            modelBuilder.Entity<LichChieu>()
                .HasOne(l => l.PhongChieu)
                .WithMany(p => p.LichChieus)
                .HasForeignKey(l => l.PhongChieuId)
                .OnDelete(DeleteBehavior.Restrict);

            // Phim -> LichChieu
            modelBuilder.Entity<LichChieu>()
                .HasOne(l => l.Phim)
                .WithMany(p => p.LichChieus)
                .HasForeignKey(l => l.PhimId)
                .OnDelete(DeleteBehavior.Restrict);

            // NguoiDung -> DonDatVe
            modelBuilder.Entity<DonDatVe>()
                .HasOne(d => d.NguoiDung)
                .WithMany(n => n.DonDatVes)
                .HasForeignKey(d => d.NguoiDungId)
                .OnDelete(DeleteBehavior.Restrict);

            // LichChieu -> DonDatVe
            modelBuilder.Entity<DonDatVe>()
                .HasOne(d => d.LichChieu)
                .WithMany(l => l.DonDatVes)
                .HasForeignKey(d => d.LichChieuId)
                .OnDelete(DeleteBehavior.Restrict);

            // DonDatVe -> Ve
            modelBuilder.Entity<Ve>()
                .HasOne(v => v.DonDatVe)
                .WithMany(d => d.Ves)
                .HasForeignKey(v => v.DonDatVeId)
                .OnDelete(DeleteBehavior.Cascade);

            // Ghe -> Ve
            modelBuilder.Entity<Ve>()
                .HasOne(v => v.Ghe)
                .WithMany(g => g.Ves)
                .HasForeignKey(v => v.GheId)
                .OnDelete(DeleteBehavior.Restrict);

            // DonDatVe -> ThanhToan
            modelBuilder.Entity<ThanhToan>()
                .HasOne(t => t.DonDatVe)
                .WithMany(d => d.ThanhToans)
                .HasForeignKey(t => t.DonDatVeId)
                .OnDelete(DeleteBehavior.Cascade);

            // Indexes
            modelBuilder.Entity<NguoiDung>()
                .HasIndex(n => n.Email)
                .IsUnique();

            modelBuilder.Entity<KhuyenMai>()
                .HasIndex(k => k.MaKhuyenMai)
                .IsUnique();
        }
    }
}

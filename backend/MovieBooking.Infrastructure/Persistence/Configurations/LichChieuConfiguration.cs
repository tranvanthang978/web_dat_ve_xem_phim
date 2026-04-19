using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MovieBooking.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MovieBooking.Infrastructure.Persistence.Configurations
{
    public class LichChieuConfiguration : IEntityTypeConfiguration<LichChieu>
    {
        public void Configure(EntityTypeBuilder<LichChieu> builder)
        {
            builder.ToTable("LichChieu");

            builder.HasKey(l => l.Id);

            builder.HasOne(l => l.Phim)
                   .WithMany(p => p.LichChieus)
                   .HasForeignKey(l => l.PhimId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(l => l.PhongChieu)
                   .WithMany(p => p.LichChieus)
                   .HasForeignKey(l => l.PhongChieuId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Property(l => l.GioBatDau)
                   .IsRequired();
        }
    }
}

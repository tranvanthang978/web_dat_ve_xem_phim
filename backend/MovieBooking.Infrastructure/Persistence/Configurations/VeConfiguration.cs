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
    public class VeConfiguration : IEntityTypeConfiguration<Ve>
    {
        public void Configure(EntityTypeBuilder<Ve> builder)
        {
            builder.ToTable("Ve");

            builder.HasKey(v => v.Id);

            // Vé -> Đơn đặt vé (1 - N)
            builder.HasOne(v => v.DonDatVe)
                   .WithMany(d => d.Ves)
                   .HasForeignKey(v => v.DonDatVeId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Vé -> Ghế (N - 1)
            builder.HasOne(v => v.Ghe)
                   .WithMany()
                   .HasForeignKey(v => v.GheId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

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
    public class PhongChieuConfiguration : IEntityTypeConfiguration<PhongChieu>
    {
        public void Configure(EntityTypeBuilder<PhongChieu> builder)
        {
            builder.ToTable("PhongChieu");

            builder.HasKey(p => p.Id);

            builder.HasOne(p => p.Rap)
                   .WithMany(r => r.PhongChieus)
                   .HasForeignKey(p => p.RapId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

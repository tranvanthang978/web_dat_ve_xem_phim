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
    public class GheConfiguration : IEntityTypeConfiguration<Ghe>
    {
        public void Configure(EntityTypeBuilder<Ghe> builder)
        {
            builder.ToTable("Ghe");

            builder.HasKey(g => g.Id);

            builder.HasOne(g => g.PhongChieu)
                   .WithMany(p => p.Ghes)
                   .HasForeignKey(g => g.PhongChieuId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

using Microsoft.EntityFrameworkCore;
using MovieBooking.Domain.Enums;
using MovieBooking.Infrastructure.Data;

namespace MovieBooking.Api.Services
{
    /// <summary>
    /// Background service tự động hủy các đơn đặt vé Pending đã hết hạn giữ ghế.
    /// Khi đơn bị hủy, ghế sẽ được giải phóng để người khác đặt.
    /// </summary>
    public class ExpiredBookingCleanupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ExpiredBookingCleanupService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(1);

        public ExpiredBookingCleanupService(
            IServiceProvider serviceProvider,
            ILogger<ExpiredBookingCleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("[BookingCleanup] Service started. Checking every {Interval} min for expired pending bookings.", 
                _checkInterval.TotalMinutes);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CleanupExpiredBookingsAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[BookingCleanup] Error during cleanup cycle.");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }
        }

        private async Task CleanupExpiredBookingsAsync(CancellationToken ct)
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<MovieBookingDbContext>();

            var now = DateTime.Now;
            var pendingStatus = BookingStatus.Pending.ToString();
            var cancelledStatus = BookingStatus.Cancelled.ToString();

            // Tìm đơn Pending đã vượt quá ExpiredAt
            var expiredBookings = await context.DonDatVes
                .Where(d => d.TrangThai == pendingStatus 
                         && d.ExpiredAt != null 
                         && d.ExpiredAt <= now)
                .ToListAsync(ct);

            if (expiredBookings.Count == 0) return;

            foreach (var booking in expiredBookings)
            {
                booking.TrangThai = cancelledStatus;
                booking.NgayCapNhat = DateTime.Now;
                _logger.LogInformation("[BookingCleanup] Auto-cancelled booking #{Id} (expired at {ExpiredAt})", 
                    booking.Id, booking.ExpiredAt);
            }

            await context.SaveChangesAsync(ct);

            _logger.LogInformation("[BookingCleanup] Cancelled {Count} expired pending booking(s).", expiredBookings.Count);
        }
    }
}

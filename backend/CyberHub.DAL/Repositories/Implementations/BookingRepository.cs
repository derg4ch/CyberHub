using CyberHub.DAL.Context;
using CyberHub.DAL.Models;
using CyberHub.DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CyberHub.DAL.Repositories.Implementations;

public class BookingRepository(AppDbContext db) : BaseRepository<Booking>(db), IBookingRepository
{
    private IQueryable<Booking> WithNav() =>
        Db.Bookings.Include(b => b.Zone).Include(b => b.Workstation).Include(b => b.Package);

    public async Task<IEnumerable<Booking>> GetTodayAsync()
    {
        var todayUtc = DateTime.UtcNow.Date;
        return await WithNav()
            .AsNoTracking()
            .Where(b => b.StartTime >= todayUtc)
            .OrderBy(b => b.StartTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Booking>> GetByUserAsync(Guid userId) =>
        await WithNav()
            .AsNoTracking()
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.StartTime)
            .ToListAsync();

    public async Task<IEnumerable<Booking>> GetByStatusAsync(string status) =>
        await WithNav()
            .AsNoTracking()
            .Where(b => b.Status == status)
            .OrderBy(b => b.StartTime)
            .ToListAsync();

    public async Task<IEnumerable<Booking>> GetRangeAsync(DateTime from, DateTime to) =>
        await WithNav()
            .AsNoTracking()
            .Where(b => b.StartTime >= from && b.StartTime <= to)
            .OrderBy(b => b.StartTime)
            .ToListAsync();

    public async Task<IEnumerable<Booking>> GetCompletedSinceAsync(DateTime since) =>
        await Db.Bookings
            .AsNoTracking()
            .Where(b => b.Status == "Completed" && b.CreatedAt >= since)
            .Select(b => new Booking { CreatedAt = b.CreatedAt, TotalPrice = b.TotalPrice, Status = b.Status })
            .ToListAsync();

    public async Task<IEnumerable<(Guid ZoneId, string ZoneName, string Tier, int Count, decimal Revenue)>> GetTopZonesAsync(
        DateTime since, int top = 5)
    {
        var result = await Db.Bookings
            .AsNoTracking()
            .Where(b => b.CreatedAt >= since && b.Zone != null)
            .GroupBy(b => new { b.ZoneId, b.Zone!.Name, b.Zone.Tier })
            .Select(g => new
            {
                g.Key.ZoneId,
                g.Key.Name,
                g.Key.Tier,
                Count = g.Count(),
                Revenue = g.Sum(b => b.TotalPrice),
            })
            .OrderByDescending(x => x.Count)
            .Take(top)
            .ToListAsync();

        return result.Select(r => (r.ZoneId, r.Name, r.Tier, r.Count, r.Revenue));
    }

    public async Task<IEnumerable<(int DayOfWeek, int Hour, int Count)>> GetHeatmapAsync(DateTime since)
    {
        // Pull minimal data, compute grouping in memory (EF limitations on DayOfWeek/Hour)
        var times = await Db.Bookings
            .AsNoTracking()
            .Where(b => b.StartTime >= since)
            .Select(b => b.StartTime)
            .ToListAsync();

        return times
            .GroupBy(dt => new { Day = (int)dt.DayOfWeek, Hour = dt.Hour })
            .Select(g => (g.Key.Day, g.Key.Hour, g.Count()));
    }

    public async Task<bool> UpdateStatusAsync(Guid id, string status)
    {
        var booking = await Db.Bookings.FindAsync(id);
        if (booking is null) return false;
        booking.Status = status;
        await Db.SaveChangesAsync();
        return true;
    }
}

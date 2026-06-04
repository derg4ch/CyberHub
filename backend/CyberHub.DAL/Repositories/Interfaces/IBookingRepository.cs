using CyberHub.DAL.Models;

namespace CyberHub.DAL.Repositories.Interfaces;

public interface IBookingRepository : IRepository<Booking>
{
    Task<IEnumerable<Booking>> GetTodayAsync();
    Task<IEnumerable<Booking>> GetByUserAsync(Guid userId);
    Task<IEnumerable<Booking>> GetByStatusAsync(string status);
    Task<IEnumerable<Booking>> GetRangeAsync(DateTime from, DateTime to);

    // Analytics queries
    Task<IEnumerable<Booking>> GetCompletedSinceAsync(DateTime since);
    Task<IEnumerable<(Guid ZoneId, string ZoneName, string Tier, int Count, decimal Revenue)>> GetTopZonesAsync(DateTime since, int top = 5);
    Task<IEnumerable<(int DayOfWeek, int Hour, int Count)>> GetHeatmapAsync(DateTime since);

    Task<bool> UpdateStatusAsync(Guid id, string status);
}

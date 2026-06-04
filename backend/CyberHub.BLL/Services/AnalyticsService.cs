using CyberHub.BLL.DTOs;
using CyberHub.BLL.Interfaces;
using CyberHub.DAL.Repositories.Interfaces;

namespace CyberHub.BLL.Services;

/// <summary>
/// Сервіс аналітики: прогноз виручки, топ зон, теплова карта.
/// Використовується адмін-панеллю.
/// </summary>
public class AnalyticsService(IBookingRepository bookingRepo) : IAnalyticsService
{
    // ──────────────────────────────────────────────────────────────
    // Revenue Forecast — просте ковзне середнє (SMA)
    // ──────────────────────────────────────────────────────────────
    public async Task<List<RevenueForecastPoint>> GetRevenueForecastAsync(
        int historyDays = 14, int forecastDays = 7)
    {
        var since = DateTime.UtcNow.AddDays(-historyDays);
        var completed = await bookingRepo.GetCompletedSinceAsync(since);

        // Build daily buckets
        var dailyRevenue = new Dictionary<DateOnly, decimal>();
        for (int i = historyDays - 1; i >= 0; i--)
            dailyRevenue[DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-i))] = 0;

        foreach (var b in completed)
        {
            var day = DateOnly.FromDateTime(b.CreatedAt);
            if (dailyRevenue.ContainsKey(day))
                dailyRevenue[day] += b.TotalPrice;
        }

        // SMA over last 7 days
        var last7 = dailyRevenue.Values.TakeLast(7).ToList();
        var avg = last7.Count > 0 ? last7.Average() : 0m;

        var result = dailyRevenue
            .Select(kv => new RevenueForecastPoint(kv.Key.ToString("MM-dd"), kv.Value, null))
            .ToList();

        for (int i = 1; i <= forecastDays; i++)
        {
            var d = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(i));
            result.Add(new RevenueForecastPoint(d.ToString("MM-dd"), null, Math.Round(avg, 2)));
        }

        return result;
    }

    // ──────────────────────────────────────────────────────────────
    // Top-N Zones
    // ──────────────────────────────────────────────────────────────
    public async Task<List<TopZoneDto>> GetTopZonesAsync(int days = 30, int top = 5)
    {
        var since = DateTime.UtcNow.AddDays(-days);
        var raw = (await bookingRepo.GetTopZonesAsync(since, top)).ToList();

        decimal totalRevenue = raw.Sum(r => r.Revenue);

        return raw.Select(r => new TopZoneDto(
            r.ZoneName,
            r.Tier,
            r.Count,
            Math.Round(r.Revenue, 2),
            totalRevenue > 0 ? Math.Round((double)(r.Revenue / totalRevenue * 100), 1) : 0.0
        )).ToList();
    }

    // ──────────────────────────────────────────────────────────────
    // Activity Heatmap (day × hour)
    // ──────────────────────────────────────────────────────────────
    public async Task<List<HeatmapCell>> GetHeatmapAsync(int days = 30)
    {
        var since = DateTime.UtcNow.AddDays(-days);
        var cells = await bookingRepo.GetHeatmapAsync(since);
        return cells.Select(c => new HeatmapCell(c.DayOfWeek, c.Hour, c.Count)).ToList();
    }

    // ──────────────────────────────────────────────────────────────
    // Full Summary (dashboard widget)
    // ──────────────────────────────────────────────────────────────
    public async Task<AnalyticsSummaryDto> GetSummaryAsync()
    {
        var todayBookings = (await bookingRepo.GetTodayAsync()).ToList();
        decimal todayRevenue = todayBookings.Where(b => b.Status == "Completed").Sum(b => b.TotalPrice);
        int activeNow       = todayBookings.Count(b => b.Status == "Active");

        var since7 = DateTime.UtcNow.AddDays(-7);
        var week   = await bookingRepo.GetCompletedSinceAsync(since7);
        decimal weekRevenue = week.Sum(b => b.TotalPrice);
        decimal avgDaily    = weekRevenue > 0 ? Math.Round(weekRevenue / 7, 2) : 0;

        var forecast = await GetRevenueForecastAsync();
        var topZones = await GetTopZonesAsync();
        var heatmap  = await GetHeatmapAsync();

        return new AnalyticsSummaryDto(
            todayRevenue, activeNow, todayBookings.Count,
            Math.Round(weekRevenue, 2), avgDaily,
            forecast, topZones, heatmap
        );
    }
}

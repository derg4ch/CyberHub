using CyberHub.BLL.DTOs;
using CyberHub.BLL.Helpers;
using CyberHub.BLL.Interfaces;
using CyberHub.DAL.UnitOfWork;

namespace CyberHub.BLL.Services;

public class AnalyticsService(IUnitOfWork uow) : IAnalyticsService
{
    public async Task<List<RevenueForecastPoint>> GetRevenueForecastAsync(
        int historyDays = 14, int forecastDays = 7)
    {
        var completed = await uow.Bookings.GetCompletedSinceAsync(
            DateHelper.UtcDaysAgo(historyDays));

        var buckets = DateHelper.BuildDailyBuckets(historyDays);
        foreach (var b in completed)
        {
            var day = DateOnly.FromDateTime(b.CreatedAt);
            if (buckets.ContainsKey(day)) buckets[day] += b.TotalPrice;
        }

        var avg = AnalyticsHelper.SimpleMovingAverage(buckets.Values, window: 7);

        var result = buckets
            .Select(kv => new RevenueForecastPoint(DateHelper.ToMonthDay(kv.Key), kv.Value, null))
            .ToList();

        for (int i = 1; i <= forecastDays; i++)
        {
            var label = DateHelper.ToMonthDay(DateTime.UtcNow.AddDays(i));
            result.Add(new RevenueForecastPoint(label, null, Math.Round(avg, 2)));
        }

        return result;
    }

    public async Task<List<TopZoneDto>> GetTopZonesAsync(int days = 30, int top = 5)
    {
        var raw = (await uow.Bookings.GetTopZonesAsync(
            DateHelper.UtcDaysAgo(days), top)).ToList();

        var totalRevenue = raw.Sum(r => r.Revenue);

        return raw.Select(r => new TopZoneDto(
            r.ZoneName,
            r.Tier,
            r.Count,
            Math.Round(r.Revenue, 2),
            AnalyticsHelper.RevenueShare(r.Revenue, totalRevenue)
        )).ToList();
    }

    public async Task<List<HeatmapCell>> GetHeatmapAsync(int days = 30)
    {
        var cells = await uow.Bookings.GetHeatmapAsync(DateHelper.UtcDaysAgo(days));
        return cells.Select(c => new HeatmapCell(c.DayOfWeek, c.Hour, c.Count)).ToList();
    }

    public async Task<AnalyticsSummaryDto> GetSummaryAsync()
    {
        var todayBookings = (await uow.Bookings.GetTodayAsync()).ToList();
        var todayRevenue  = todayBookings.Where(b => b.Status == "Completed").Sum(b => b.TotalPrice);
        var activeNow     = todayBookings.Count(b => b.Status == "Active");

        var week        = await uow.Bookings.GetCompletedSinceAsync(DateHelper.UtcDaysAgo(7));
        var weekRevenue = week.Sum(b => b.TotalPrice);
        var avgDaily    = weekRevenue > 0 ? Math.Round(weekRevenue / 7, 2) : 0m;

        return new AnalyticsSummaryDto(
            todayRevenue, activeNow, todayBookings.Count,
            Math.Round(weekRevenue, 2), avgDaily,
            await GetRevenueForecastAsync(),
            await GetTopZonesAsync(),
            await GetHeatmapAsync()
        );
    }
}

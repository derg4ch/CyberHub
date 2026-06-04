using CyberHub.BLL.DTOs;

namespace CyberHub.BLL.Interfaces;

public interface IAnalyticsService
{
    Task<List<RevenueForecastPoint>> GetRevenueForecastAsync(int historyDays = 14, int forecastDays = 7);
    Task<List<TopZoneDto>>           GetTopZonesAsync(int days = 30, int top = 5);
    Task<List<HeatmapCell>>          GetHeatmapAsync(int days = 30);
    Task<AnalyticsSummaryDto>        GetSummaryAsync();
}

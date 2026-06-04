using CyberHub.BLL.DTOs;
using CyberHub.BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CyberHub.API.Controllers;

/// <summary>
/// Аналітика адмін-панелі: прогноз виручки, топ зон, теплова карта.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Tags("Analytics")]
public class AnalyticsController(IAnalyticsService analyticsService) : ControllerBase
{
    /// <summary>Зведена аналітика (today + week + forecast + heatmap).</summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(AnalyticsSummaryDto), 200)]
    public async Task<IActionResult> Summary() =>
        Ok(await analyticsService.GetSummaryAsync());

    /// <summary>Прогноз виручки на наступні 7 днів (SMA).</summary>
    [HttpGet("revenue-forecast")]
    [ProducesResponseType(typeof(List<RevenueForecastPoint>), 200)]
    public async Task<IActionResult> RevenueForecast(
        [FromQuery] int historyDays = 14,
        [FromQuery] int forecastDays = 7) =>
        Ok(await analyticsService.GetRevenueForecastAsync(historyDays, forecastDays));

    /// <summary>Топ-5 зон за кількістю бронювань за останні N днів.</summary>
    [HttpGet("top-zones")]
    [ProducesResponseType(typeof(List<TopZoneDto>), 200)]
    public async Task<IActionResult> TopZones(
        [FromQuery] int days = 30,
        [FromQuery] int top = 5) =>
        Ok(await analyticsService.GetTopZonesAsync(days, top));

    /// <summary>Теплова карта активності (день тижня × година доби).</summary>
    [HttpGet("heatmap")]
    [ProducesResponseType(typeof(List<HeatmapCell>), 200)]
    public async Task<IActionResult> Heatmap([FromQuery] int days = 30) =>
        Ok(await analyticsService.GetHeatmapAsync(days));
}

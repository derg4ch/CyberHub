namespace CyberHub.BLL.DTOs;

/// <summary>Одна точка на графіку прогнозу виручки.</summary>
public record RevenueForecastPoint(
    string Date,
    decimal? Actual,
    decimal? Forecast
);

/// <summary>Рядок таблиці "Топ-5 зон за кількістю бронювань".</summary>
public record TopZoneDto(
    string ZoneName,
    string Tier,
    int BookingCount,
    decimal TotalRevenue,
    double RevenueShare   // % від загального за той самий період
);

/// <summary>Комірка теплової карти активності.</summary>
public record HeatmapCell(
    int DayOfWeek,   // 0=Sun … 6=Sat
    int Hour,        // 0–23
    int Count
);

/// <summary>Зведена аналітика для головного дашборду адміна.</summary>
public record AnalyticsSummaryDto(
    decimal TodayRevenue,
    int     ActiveNow,
    int     TotalTodayBookings,
    decimal WeekRevenue,
    decimal AvgDailyRevenue,
    List<RevenueForecastPoint> RevenueForecast,
    List<TopZoneDto>           TopZones,
    List<HeatmapCell>          Heatmap
);

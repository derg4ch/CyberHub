namespace CyberHub.BLL.Helpers;

public static class AnalyticsHelper
{
    public static decimal SimpleMovingAverage(IEnumerable<decimal> values, int window)
    {
        var tail = values.TakeLast(window).ToList();
        return tail.Count > 0 ? tail.Average() : 0m;
    }

    public static double RevenueShare(decimal value, decimal total)
        => total > 0 ? Math.Round((double)(value / total * 100), 1) : 0.0;
}

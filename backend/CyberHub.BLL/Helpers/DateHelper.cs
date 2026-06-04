namespace CyberHub.BLL.Helpers;

public static class DateHelper
{
    public static DateTime UtcDaysAgo(int days) => DateTime.UtcNow.AddDays(-days);

    public static Dictionary<DateOnly, decimal> BuildDailyBuckets(int days)
    {
        var buckets = new Dictionary<DateOnly, decimal>();
        for (int i = days - 1; i >= 0; i--)
            buckets[DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-i))] = 0m;
        return buckets;
    }

    public static string ToMonthDay(DateOnly date) => date.ToString("MM-dd");

    public static string ToMonthDay(DateTime date) => DateOnly.FromDateTime(date).ToString("MM-dd");
}

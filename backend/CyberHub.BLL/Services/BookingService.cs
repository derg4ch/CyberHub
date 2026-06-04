using CyberHub.BLL.DTOs;
using CyberHub.BLL.Interfaces;
using CyberHub.DAL.Models;
using CyberHub.DAL.Repositories.Interfaces;

namespace CyberHub.BLL.Services;

public class BookingService(IBookingRepository repo) : IBookingService
{
    public async Task<IEnumerable<BookingDto>> GetAllAsync(
        string? status = null, DateTime? from = null, DateTime? to = null)
    {
        IEnumerable<Booking> bookings;

        if (!string.IsNullOrEmpty(status))
            bookings = await repo.GetByStatusAsync(status);
        else if (from.HasValue && to.HasValue)
            bookings = await repo.GetRangeAsync(from.Value, to.Value);
        else
            bookings = await repo.GetAllAsync();

        return bookings.Select(ToDto);
    }

    public async Task<IEnumerable<BookingDto>> GetTodayAsync()
    {
        var bookings = await repo.GetTodayAsync();
        return bookings.Select(ToDto);
    }

    public async Task<IEnumerable<BookingDto>> GetByUserAsync(Guid userId)
    {
        var bookings = await repo.GetByUserAsync(userId);
        return bookings.Select(ToDto);
    }

    public async Task<BookingDto?> GetByIdAsync(Guid id)
    {
        var b = await repo.GetByIdAsync(id);
        return b is null ? null : ToDto(b);
    }

    public async Task<BookingDto> CreateAsync(CreateBookingRequest r)
    {
        var booking = new Booking
        {
            Id             = Guid.NewGuid(),
            UserId         = r.UserId,
            WorkstationId  = r.WorkstationId,
            ZoneId         = r.ZoneId,
            PackageId      = r.PackageId,
            StartTime      = r.StartTime.ToUniversalTime(),
            EndTime        = r.EndTime.ToUniversalTime(),
            Status         = "Pending",
            TotalPrice     = r.TotalPrice,
            XpEarned       = r.XpEarned,
            Notes          = r.Notes,
            CreatedAt      = DateTime.UtcNow,
        };
        await repo.CreateAsync(booking);
        return ToDto(booking);
    }

    public async Task<bool> UpdateStatusAsync(Guid id, UpdateBookingStatusRequest r)
    {
        var allowed = new[] { "Pending", "Confirmed", "Active", "Completed", "Cancelled", "No-Show" };
        if (!allowed.Contains(r.Status))
            throw new ArgumentException($"Invalid status: {r.Status}");

        return await repo.UpdateStatusAsync(id, r.Status);
    }

    private static BookingDto ToDto(Booking b) => new(
        b.Id, b.UserId, b.WorkstationId, b.ZoneId, b.PackageId,
        b.StartTime, b.EndTime, b.Status, b.TotalPrice, b.XpEarned, b.Notes, b.CreatedAt,
        b.Zone?.Name, b.Zone?.Tier, b.Workstation?.Name, b.Package?.Name
    );
}

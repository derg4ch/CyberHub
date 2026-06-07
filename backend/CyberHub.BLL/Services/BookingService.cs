using CyberHub.BLL.DTOs;
using CyberHub.BLL.Exceptions;
using CyberHub.BLL.Interfaces;
using CyberHub.DAL.Models;
using CyberHub.DAL.UnitOfWork;

namespace CyberHub.BLL.Services;

public class BookingService(IUnitOfWork uow) : IBookingService
{
    private static readonly string[] AllowedStatuses =
        ["Pending", "Confirmed", "Active", "Completed", "Cancelled", "No-Show"];

    public async Task<IEnumerable<BookingDto>> GetAllAsync(
        string? status = null, DateTime? from = null, DateTime? to = null)
    {
        var bookings = (!string.IsNullOrEmpty(status))
            ? await uow.Bookings.GetByStatusAsync(status)
            : (from.HasValue && to.HasValue)
                ? await uow.Bookings.GetRangeAsync(from.Value, to.Value)
                : await uow.Bookings.GetAllAsync();

        return await MapWithUsernamesAsync(bookings);
    }

    public async Task<IEnumerable<BookingDto>> GetTodayAsync()
        => await MapWithUsernamesAsync(await uow.Bookings.GetTodayAsync());

    public async Task<IEnumerable<BookingDto>> GetByUserAsync(Guid userId)
        => await MapWithUsernamesAsync(await uow.Bookings.GetByUserAsync(userId));

    public async Task<BookingDto?> GetByIdAsync(Guid id)
    {
        var booking = await uow.Bookings.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Booking), id);
        var user = await uow.Users.GetByIdAsync(booking.UserId);
        return Map(booking, user?.Username);
    }

    public async Task<BookingDto> CreateAsync(CreateBookingRequest request)
    {
        var booking = new Booking
        {
            UserId        = request.UserId,
            WorkstationId = request.WorkstationId,
            ZoneId        = request.ZoneId,
            PackageId     = request.PackageId,
            StartTime     = request.StartTime,
            EndTime       = request.EndTime,
            TotalPrice    = request.TotalPrice,
            XpEarned      = request.XpEarned,
            Notes         = request.Notes,
            Status        = "Pending",
        };
        await uow.Bookings.CreateAsync(booking);
        await uow.SaveChangesAsync();
        return Map(booking, null);
    }

    public async Task<bool> UpdateStatusAsync(Guid id, UpdateBookingStatusRequest request)
    {
        if (!AllowedStatuses.Contains(request.Status))
            throw new ValidationException(nameof(request.Status),
                $"'{request.Status}' is not a valid booking status.");

        var updated = await uow.Bookings.UpdateStatusAsync(id, request.Status);
        if (!updated) throw new NotFoundException(nameof(Booking), id);
        await uow.SaveChangesAsync();
        return true;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private async Task<IEnumerable<BookingDto>> MapWithUsernamesAsync(IEnumerable<Booking> bookings)
    {
        var list    = bookings.ToList();
        var userIds = list.Select(b => b.UserId).Distinct().ToList();
        var users   = await uow.Users.GetAllAsync();
        var userMap = users
            .Where(u => userIds.Contains(u.Id))
            .ToDictionary(u => u.Id, u => u.Username);

        return list.Select(b => Map(b, userMap.GetValueOrDefault(b.UserId)));
    }

    private static BookingDto Map(Booking b, string? username) => new(
        b.Id, b.UserId, b.WorkstationId, b.ZoneId, b.PackageId,
        b.StartTime, b.EndTime, b.Status,
        b.TotalPrice, b.XpEarned, b.Notes, b.CreatedAt,
        b.Zone?.Name, b.Zone?.Tier, b.Workstation?.Name, b.Package?.Name,
        username
    );
}

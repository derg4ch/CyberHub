using CyberHub.BLL.DTOs;
using CyberHub.BLL.Exceptions;
using CyberHub.BLL.Interfaces;
using CyberHub.DAL.Models;
using CyberHub.DAL.UnitOfWork;
using Mapster;

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

        return bookings.Adapt<IEnumerable<BookingDto>>();
    }

    public async Task<IEnumerable<BookingDto>> GetTodayAsync()
        => (await uow.Bookings.GetTodayAsync()).Adapt<IEnumerable<BookingDto>>();

    public async Task<IEnumerable<BookingDto>> GetByUserAsync(Guid userId)
        => (await uow.Bookings.GetByUserAsync(userId)).Adapt<IEnumerable<BookingDto>>();

    public async Task<BookingDto?> GetByIdAsync(Guid id)
    {
        var booking = await uow.Bookings.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Booking), id);
        return booking.Adapt<BookingDto>();
    }

    public async Task<BookingDto> CreateAsync(CreateBookingRequest request)
    {
        var booking = request.Adapt<Booking>();
        await uow.Bookings.CreateAsync(booking);
        await uow.SaveChangesAsync();
        return booking.Adapt<BookingDto>();
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
}

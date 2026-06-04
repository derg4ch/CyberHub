using CyberHub.BLL.DTOs;

namespace CyberHub.BLL.Interfaces;

public interface IBookingService
{
    Task<IEnumerable<BookingDto>> GetAllAsync(string? status = null, DateTime? from = null, DateTime? to = null);
    Task<IEnumerable<BookingDto>> GetTodayAsync();
    Task<IEnumerable<BookingDto>> GetByUserAsync(Guid userId);
    Task<BookingDto?> GetByIdAsync(Guid id);
    Task<BookingDto> CreateAsync(CreateBookingRequest request);
    Task<bool> UpdateStatusAsync(Guid id, UpdateBookingStatusRequest request);
}

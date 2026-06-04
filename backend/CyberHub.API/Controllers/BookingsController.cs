using CyberHub.BLL.DTOs;
using CyberHub.BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CyberHub.API.Controllers;

/// <summary>Управління бронюваннями.</summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Tags("Bookings")]
public class BookingsController(IBookingService bookingService) : ControllerBase
{
    /// <summary>Список бронювань з фільтрами.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<BookingDto>), 200)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to) =>
        Ok(await bookingService.GetAllAsync(status, from, to));

    /// <summary>Бронювання за сьогодні (для Live Monitor).</summary>
    [HttpGet("today")]
    [ProducesResponseType(typeof(IEnumerable<BookingDto>), 200)]
    public async Task<IActionResult> GetToday() =>
        Ok(await bookingService.GetTodayAsync());

    /// <summary>Бронювання конкретного користувача.</summary>
    [HttpGet("user/{userId:guid}")]
    [ProducesResponseType(typeof(IEnumerable<BookingDto>), 200)]
    public async Task<IActionResult> GetByUser(Guid userId) =>
        Ok(await bookingService.GetByUserAsync(userId));

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(BookingDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var b = await bookingService.GetByIdAsync(id);
        return b is null ? NotFound() : Ok(b);
    }

    [HttpPost]
    [ProducesResponseType(typeof(BookingDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreateBookingRequest request)
    {
        var dto = await bookingService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    /// <summary>Змінити статус бронювання (адмін-операція).</summary>
    [HttpPatch("{id:guid}/status")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400), ProducesResponseType(404)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateBookingStatusRequest request)
    {
        try
        {
            var updated = await bookingService.UpdateStatusAsync(id, request);
            return updated ? NoContent() : NotFound();
        }
        catch (ArgumentException ex) { return BadRequest(ex.Message); }
    }
}

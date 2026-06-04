using CyberHub.BLL.DTOs;
using CyberHub.BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CyberHub.API.Controllers;

/// <summary>Управління кіберспортивними турнірами.</summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Tags("Tournaments")]
public class TournamentsController(ITournamentService tournamentService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TournamentDto>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] string? status) =>
        Ok(await tournamentService.GetAllAsync(status));

    /// <summary>Тільки заплановані / відкрита реєстрація (для лендінгу).</summary>
    [HttpGet("upcoming")]
    [ProducesResponseType(typeof(IEnumerable<TournamentDto>), 200)]
    public async Task<IActionResult> GetUpcoming() =>
        Ok(await tournamentService.GetUpcomingAsync());

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TournamentDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var t = await tournamentService.GetByIdAsync(id);
        return t is null ? NotFound() : Ok(t);
    }

    [HttpPost]
    [ProducesResponseType(typeof(TournamentDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreateTournamentRequest request)
    {
        var dto = await tournamentService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(TournamentDto), 200)]
    [ProducesResponseType(400), ProducesResponseType(404)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTournamentRequest request)
    {
        if (id != request.Id) return BadRequest("Route id mismatch");
        try { return Ok(await tournamentService.UpdateAsync(request)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(204), ProducesResponseType(404)]
    public async Task<IActionResult> Delete(Guid id)
    {
        try { await tournamentService.DeleteAsync(id); return NoContent(); }
        catch (KeyNotFoundException) { return NotFound(); }
    }
}

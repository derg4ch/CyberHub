using CyberHub.BLL.DTOs;
using CyberHub.BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CyberHub.API.Controllers;

/// <summary>Управління ігровими зонами.</summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Tags("Zones")]
public class ZonesController(IZoneService zoneService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ZoneDto>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] bool? active) =>
        Ok(await zoneService.GetAllAsync(active));

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ZoneDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var zone = await zoneService.GetByIdAsync(id);
        return zone is null ? NotFound() : Ok(zone);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ZoneDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreateZoneRequest request)
    {
        var dto = await zoneService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ZoneDto), 200)]
    [ProducesResponseType(400), ProducesResponseType(404)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateZoneRequest request)
    {
        if (id != request.Id) return BadRequest("Route id mismatch");
        try { return Ok(await zoneService.UpdateAsync(request)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(Guid id)
    {
        try { await zoneService.DeleteAsync(id); return NoContent(); }
        catch (KeyNotFoundException) { return NotFound(); }
    }
}

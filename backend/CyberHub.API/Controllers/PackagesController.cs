using CyberHub.BLL.DTOs;
using CyberHub.BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CyberHub.API.Controllers;

/// <summary>Управління тарифними пакетами.</summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Tags("Packages")]
public class PackagesController(IPackageService packageService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<PackageDto>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] bool? active) =>
        Ok(await packageService.GetAllAsync(active));

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(PackageDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var pkg = await packageService.GetByIdAsync(id);
        return pkg is null ? NotFound() : Ok(pkg);
    }

    [HttpPost]
    [ProducesResponseType(typeof(PackageDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreatePackageRequest request)
    {
        var dto = await packageService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(PackageDto), 200)]
    [ProducesResponseType(400), ProducesResponseType(404)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePackageRequest request)
    {
        if (id != request.Id) return BadRequest("Route id mismatch");
        try { return Ok(await packageService.UpdateAsync(request)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(204), ProducesResponseType(404)]
    public async Task<IActionResult> Delete(Guid id)
    {
        try { await packageService.DeleteAsync(id); return NoContent(); }
        catch (KeyNotFoundException) { return NotFound(); }
    }
}

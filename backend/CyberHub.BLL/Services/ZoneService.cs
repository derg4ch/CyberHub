using CyberHub.BLL.DTOs;
using CyberHub.BLL.Interfaces;
using CyberHub.DAL.Models;
using CyberHub.DAL.Repositories.Interfaces;

namespace CyberHub.BLL.Services;

public class ZoneService(IZoneRepository repo) : IZoneService
{
    public async Task<IEnumerable<ZoneDto>> GetAllAsync(bool? active = null)
    {
        var zones = active.HasValue
            ? active.Value ? await repo.GetActiveAsync() : await repo.GetAllAsync()
            : await repo.GetAllAsync();
        return zones.Select(ToDto);
    }

    public async Task<ZoneDto?> GetByIdAsync(Guid id)
    {
        var z = await repo.GetByIdAsync(id);
        return z is null ? null : ToDto(z);
    }

    public async Task<ZoneDto> CreateAsync(CreateZoneRequest r)
    {
        var zone = new Zone
        {
            Id          = Guid.NewGuid(),
            Name        = r.Name,
            Description = r.Description,
            Tier        = r.Tier,
            HourlyRate  = r.HourlyRate,
            SeatCount   = r.SeatCount,
            ImageUrl    = r.ImageUrl,
            IsActive    = r.IsActive,
            CreatedAt   = DateTime.UtcNow,
        };
        await repo.CreateAsync(zone);
        return ToDto(zone);
    }

    public async Task<ZoneDto> UpdateAsync(UpdateZoneRequest r)
    {
        var zone = await repo.GetByIdAsync(r.Id)
            ?? throw new KeyNotFoundException($"Zone {r.Id} not found");

        zone.Name        = r.Name;
        zone.Description = r.Description;
        zone.Tier        = r.Tier;
        zone.HourlyRate  = r.HourlyRate;
        zone.SeatCount   = r.SeatCount;
        zone.ImageUrl    = r.ImageUrl;
        zone.IsActive    = r.IsActive;

        await repo.UpdateAsync(zone);
        return ToDto(zone);
    }

    public Task DeleteAsync(Guid id) => repo.DeleteAsync(id);

    private static ZoneDto ToDto(Zone z) => new(
        z.Id, z.Name, z.Description, z.Tier,
        z.HourlyRate, z.SeatCount, z.ImageUrl, z.IsActive, z.CreatedAt
    );
}

using CyberHub.BLL.DTOs;
using CyberHub.BLL.Exceptions;
using CyberHub.BLL.Interfaces;
using CyberHub.DAL.Models;
using CyberHub.DAL.UnitOfWork;
using Mapster;

namespace CyberHub.BLL.Services;

public class ZoneService(IUnitOfWork uow) : IZoneService
{
    public async Task<IEnumerable<ZoneDto>> GetAllAsync(bool? active = null)
    {
        var zones = active switch
        {
            true  => await uow.Zones.GetActiveAsync(),
            false => await uow.Zones.GetAllAsync(),
            null  => await uow.Zones.GetAllAsync(),
        };
        return zones.Adapt<IEnumerable<ZoneDto>>();
    }

    public async Task<ZoneDto?> GetByIdAsync(Guid id)
    {
        var zone = await uow.Zones.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Zone), id);
        return zone.Adapt<ZoneDto>();
    }

    public async Task<ZoneDto> CreateAsync(CreateZoneRequest request)
    {
        var zone = request.Adapt<Zone>();
        await uow.Zones.CreateAsync(zone);
        await uow.SaveChangesAsync();
        return zone.Adapt<ZoneDto>();
    }

    public async Task<ZoneDto> UpdateAsync(UpdateZoneRequest request)
    {
        var zone = await uow.Zones.GetByIdAsync(request.Id)
            ?? throw new NotFoundException(nameof(Zone), request.Id);

        request.Adapt(zone);
        await uow.Zones.UpdateAsync(zone);
        await uow.SaveChangesAsync();
        return zone.Adapt<ZoneDto>();
    }

    public async Task DeleteAsync(Guid id)
    {
        if (!await uow.Zones.ExistsAsync(id))
            throw new NotFoundException(nameof(Zone), id);
        await uow.Zones.DeleteAsync(id);
        await uow.SaveChangesAsync();
    }

    public async Task<IEnumerable<WorkstationDto>> GetAllWorkstationsAsync(bool? active = null)
    {
        var zones = await uow.Zones.GetAllAsync();
        var allWs = new List<WorkstationDto>();
        foreach (var zone in zones)
        {
            var z = await uow.Zones.GetWithWorkstationsAsync(zone.Id);
            if (z is null) continue;
            var ws = active == true ? z.Workstations.Where(w => w.IsActive) : z.Workstations;
            allWs.AddRange(ws.Select(w => new WorkstationDto(w.Id, w.ZoneId, w.Name, w.PositionX, w.PositionY, w.IsActive)));
        }
        return allWs;
    }

    public async Task<IEnumerable<WorkstationDto>?> GetWorkstationsAsync(Guid zoneId)
    {
        var zone = await uow.Zones.GetWithWorkstationsAsync(zoneId);
        if (zone is null) return null;
        return zone.Workstations.Select(w => new WorkstationDto(
            w.Id, w.ZoneId, w.Name, w.PositionX, w.PositionY, w.IsActive));
    }
}

using CyberHub.BLL.DTOs;

namespace CyberHub.BLL.Interfaces;

public interface IZoneService
{
    Task<IEnumerable<ZoneDto>> GetAllAsync(bool? active = null);
    Task<ZoneDto?> GetByIdAsync(Guid id);
    Task<ZoneDto> CreateAsync(CreateZoneRequest request);
    Task<ZoneDto> UpdateAsync(UpdateZoneRequest request);
    Task DeleteAsync(Guid id);
    Task<IEnumerable<WorkstationDto>?> GetWorkstationsAsync(Guid zoneId);
    Task<IEnumerable<WorkstationDto>>  GetAllWorkstationsAsync(bool? active = null);
}

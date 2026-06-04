using CyberHub.DAL.Models;

namespace CyberHub.DAL.Repositories.Interfaces;

public interface IZoneRepository : IRepository<Zone>
{
    Task<IEnumerable<Zone>> GetActiveAsync();
    Task<Zone?> GetWithWorkstationsAsync(Guid id);
}

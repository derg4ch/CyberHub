using CyberHub.DAL.Models;

namespace CyberHub.DAL.Repositories.Interfaces;

public interface IPackageRepository : IRepository<Package>
{
    Task<IEnumerable<Package>> GetActiveAsync();
}

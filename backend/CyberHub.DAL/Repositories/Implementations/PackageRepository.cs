using CyberHub.DAL.Context;
using CyberHub.DAL.Models;
using CyberHub.DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CyberHub.DAL.Repositories.Implementations;

public class PackageRepository(AppDbContext db) : BaseRepository<Package>(db), IPackageRepository
{
    public async Task<IEnumerable<Package>> GetActiveAsync() =>
        await Db.Packages
            .AsNoTracking()
            .Where(p => p.IsActive)
            .OrderBy(p => p.Price)
            .ToListAsync();
}

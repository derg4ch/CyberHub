using CyberHub.DAL.Context;
using CyberHub.DAL.Models;
using CyberHub.DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CyberHub.DAL.Repositories.Implementations;

public class ZoneRepository(AppDbContext db) : BaseRepository<Zone>(db), IZoneRepository
{
    public async Task<IEnumerable<Zone>> GetActiveAsync() =>
        await Db.Zones
            .AsNoTracking()
            .Where(z => z.IsActive)
            .OrderBy(z => z.HourlyRate)
            .ToListAsync();

    public async Task<Zone?> GetWithWorkstationsAsync(Guid id) =>
        await Db.Zones
            .Include(z => z.Workstations.Where(w => w.IsActive))
            .FirstOrDefaultAsync(z => z.Id == id);
}

using CyberHub.DAL.Context;
using CyberHub.DAL.Models;
using CyberHub.DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CyberHub.DAL.Repositories.Implementations;

public class TournamentRepository(AppDbContext db) : BaseRepository<Tournament>(db), ITournamentRepository
{
    public async Task<IEnumerable<Tournament>> GetByStatusAsync(string status) =>
        await Db.Tournaments
            .AsNoTracking()
            .Where(t => t.Status == status)
            .OrderBy(t => t.StartTime)
            .ToListAsync();

    public async Task<IEnumerable<Tournament>> GetUpcomingAsync() =>
        await Db.Tournaments
            .AsNoTracking()
            .Where(t => t.Status == "Upcoming" || t.Status == "Registration Open")
            .OrderBy(t => t.StartTime)
            .ToListAsync();
}

using CyberHub.DAL.Models;

namespace CyberHub.DAL.Repositories.Interfaces;

public interface ITournamentRepository : IRepository<Tournament>
{
    Task<IEnumerable<Tournament>> GetByStatusAsync(string status);
    Task<IEnumerable<Tournament>> GetUpcomingAsync();
}

using CyberHub.BLL.DTOs;

namespace CyberHub.BLL.Interfaces;

public interface ITournamentService
{
    Task<IEnumerable<TournamentDto>> GetAllAsync(string? status = null);
    Task<IEnumerable<TournamentDto>> GetUpcomingAsync();
    Task<TournamentDto?> GetByIdAsync(Guid id);
    Task<TournamentDto> CreateAsync(CreateTournamentRequest request);
    Task<TournamentDto> UpdateAsync(UpdateTournamentRequest request);
    Task DeleteAsync(Guid id);
}

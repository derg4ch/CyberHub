using CyberHub.BLL.DTOs;
using CyberHub.BLL.Interfaces;
using CyberHub.DAL.Models;
using CyberHub.DAL.Repositories.Interfaces;

namespace CyberHub.BLL.Services;

public class TournamentService(ITournamentRepository repo) : ITournamentService
{
    public async Task<IEnumerable<TournamentDto>> GetAllAsync(string? status = null)
    {
        var items = string.IsNullOrEmpty(status)
            ? await repo.GetAllAsync()
            : await repo.GetByStatusAsync(status);
        return items.Select(ToDto);
    }

    public async Task<IEnumerable<TournamentDto>> GetUpcomingAsync()
    {
        var items = await repo.GetUpcomingAsync();
        return items.Select(ToDto);
    }

    public async Task<TournamentDto?> GetByIdAsync(Guid id)
    {
        var t = await repo.GetByIdAsync(id);
        return t is null ? null : ToDto(t);
    }

    public async Task<TournamentDto> CreateAsync(CreateTournamentRequest r)
    {
        var t = new Tournament
        {
            Id                  = Guid.NewGuid(),
            Name                = r.Name,
            Game                = r.Game,
            Description         = r.Description,
            PrizePool           = r.PrizePool,
            EntryFee            = r.EntryFee,
            MaxParticipants     = r.MaxParticipants,
            CurrentParticipants = 0,
            StartTime           = r.StartTime?.ToUniversalTime(),
            Status              = r.Status,
            ImageUrl            = r.ImageUrl,
            CreatedAt           = DateTime.UtcNow,
        };
        await repo.CreateAsync(t);
        return ToDto(t);
    }

    public async Task<TournamentDto> UpdateAsync(UpdateTournamentRequest r)
    {
        var t = await repo.GetByIdAsync(r.Id)
            ?? throw new KeyNotFoundException($"Tournament {r.Id} not found");

        t.Name            = r.Name;
        t.Game            = r.Game;
        t.Description     = r.Description;
        t.PrizePool       = r.PrizePool;
        t.EntryFee        = r.EntryFee;
        t.MaxParticipants = r.MaxParticipants;
        t.StartTime       = r.StartTime?.ToUniversalTime();
        t.Status          = r.Status;
        t.ImageUrl        = r.ImageUrl;

        await repo.UpdateAsync(t);
        return ToDto(t);
    }

    public Task DeleteAsync(Guid id) => repo.DeleteAsync(id);

    private static TournamentDto ToDto(Tournament t) => new(
        t.Id, t.Name, t.Game, t.Description, t.PrizePool, t.EntryFee,
        t.MaxParticipants, t.CurrentParticipants, t.StartTime,
        t.Status, t.ImageUrl, t.CreatedAt
    );
}

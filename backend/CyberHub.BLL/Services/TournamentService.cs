using CyberHub.BLL.DTOs;
using CyberHub.BLL.Exceptions;
using CyberHub.BLL.Interfaces;
using CyberHub.DAL.Models;
using CyberHub.DAL.UnitOfWork;
using Mapster;

namespace CyberHub.BLL.Services;

public class TournamentService(IUnitOfWork uow) : ITournamentService
{
    public async Task<IEnumerable<TournamentDto>> GetAllAsync(string? status = null)
    {
        var items = string.IsNullOrEmpty(status)
            ? await uow.Tournaments.GetAllAsync()
            : await uow.Tournaments.GetByStatusAsync(status);
        return items.Adapt<IEnumerable<TournamentDto>>();
    }

    public async Task<IEnumerable<TournamentDto>> GetUpcomingAsync()
        => (await uow.Tournaments.GetUpcomingAsync()).Adapt<IEnumerable<TournamentDto>>();

    public async Task<TournamentDto?> GetByIdAsync(Guid id)
    {
        var t = await uow.Tournaments.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Tournament), id);
        return t.Adapt<TournamentDto>();
    }

    public async Task<TournamentDto> CreateAsync(CreateTournamentRequest request)
    {
        var t = request.Adapt<Tournament>();
        await uow.Tournaments.CreateAsync(t);
        await uow.SaveChangesAsync();
        return t.Adapt<TournamentDto>();
    }

    public async Task<TournamentDto> UpdateAsync(UpdateTournamentRequest request)
    {
        var t = await uow.Tournaments.GetByIdAsync(request.Id)
            ?? throw new NotFoundException(nameof(Tournament), request.Id);

        request.Adapt(t);
        if (request.StartTime.HasValue) t.StartTime = request.StartTime.Value.ToUniversalTime();
        await uow.Tournaments.UpdateAsync(t);
        await uow.SaveChangesAsync();
        return t.Adapt<TournamentDto>();
    }

    public async Task DeleteAsync(Guid id)
    {
        if (!await uow.Tournaments.ExistsAsync(id))
            throw new NotFoundException(nameof(Tournament), id);
        await uow.Tournaments.DeleteAsync(id);
        await uow.SaveChangesAsync();
    }
}

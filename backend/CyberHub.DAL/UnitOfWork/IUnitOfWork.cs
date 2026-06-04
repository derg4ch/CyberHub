using CyberHub.DAL.Repositories.Interfaces;

namespace CyberHub.DAL.UnitOfWork;

public interface IUnitOfWork : IAsyncDisposable
{
    IZoneRepository       Zones       { get; }
    IPackageRepository    Packages    { get; }
    IBookingRepository    Bookings    { get; }
    ITournamentRepository Tournaments { get; }

    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

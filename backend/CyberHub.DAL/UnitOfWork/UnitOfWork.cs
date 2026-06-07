using CyberHub.DAL.Context;
using CyberHub.DAL.Repositories.Implementations;
using CyberHub.DAL.Repositories.Interfaces;

namespace CyberHub.DAL.UnitOfWork;

public sealed class UnitOfWork(AppDbContext db) : IUnitOfWork
{
    private IUserRepository?       _users;
    private IZoneRepository?       _zones;
    private IPackageRepository?    _packages;
    private IBookingRepository?    _bookings;
    private ITournamentRepository? _tournaments;

    public IUserRepository       Users       => _users       ??= new UserRepository(db);
    public IZoneRepository       Zones       => _zones       ??= new ZoneRepository(db);
    public IPackageRepository    Packages    => _packages    ??= new PackageRepository(db);
    public IBookingRepository    Bookings    => _bookings    ??= new BookingRepository(db);
    public ITournamentRepository Tournaments => _tournaments ??= new TournamentRepository(db);

    public Task<int> SaveChangesAsync(CancellationToken ct = default)
        => db.SaveChangesAsync(ct);

    public ValueTask DisposeAsync() => db.DisposeAsync();
}

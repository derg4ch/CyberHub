using CyberHub.BLL.DTOs;
using CyberHub.DAL.Models;
using Mapster;

namespace CyberHub.BLL.Mapping;

public static class MapsterConfig
{
    public static void Register()
    {
        TypeAdapterConfig<Zone, ZoneDto>.NewConfig();

        TypeAdapterConfig<Package, PackageDto>.NewConfig();

        TypeAdapterConfig<Booking, BookingDto>.NewConfig()
            .Map(dest => dest.ZoneName,         src => src.Zone != null        ? src.Zone.Name        : null)
            .Map(dest => dest.ZoneTier,         src => src.Zone != null        ? src.Zone.Tier        : null)
            .Map(dest => dest.WorkstationName,  src => src.Workstation != null ? src.Workstation.Name : null)
            .Map(dest => dest.PackageName,      src => src.Package != null     ? src.Package.Name     : null);

        TypeAdapterConfig<Tournament, TournamentDto>.NewConfig();

        TypeAdapterConfig<CreateZoneRequest, Zone>.NewConfig()
            .Map(dest => dest.Id,        _ => Guid.NewGuid())
            .Map(dest => dest.CreatedAt, _ => DateTime.UtcNow);

        TypeAdapterConfig<CreatePackageRequest, Package>.NewConfig()
            .Map(dest => dest.Id,        _ => Guid.NewGuid())
            .Map(dest => dest.CreatedAt, _ => DateTime.UtcNow);

        TypeAdapterConfig<CreateBookingRequest, Booking>.NewConfig()
            .Map(dest => dest.Id,        _ => Guid.NewGuid())
            .Map(dest => dest.Status,    _ => "Pending")
            .Map(dest => dest.CreatedAt, _ => DateTime.UtcNow)
            .Map(dest => dest.StartTime, src => src.StartTime.ToUniversalTime())
            .Map(dest => dest.EndTime,   src => src.EndTime.ToUniversalTime());

        TypeAdapterConfig<CreateTournamentRequest, Tournament>.NewConfig()
            .Map(dest => dest.Id,                  _ => Guid.NewGuid())
            .Map(dest => dest.CreatedAt,            _ => DateTime.UtcNow)
            .Map(dest => dest.CurrentParticipants,  _ => 0)
            .Map(dest => dest.StartTime,
                src => src.StartTime.HasValue ? src.StartTime.Value.ToUniversalTime() : (DateTime?)null);
    }
}

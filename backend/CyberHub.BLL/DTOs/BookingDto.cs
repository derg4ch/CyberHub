using System.ComponentModel.DataAnnotations;

namespace CyberHub.BLL.DTOs;

public record BookingDto(
    Guid Id, Guid UserId, Guid WorkstationId, Guid ZoneId, Guid? PackageId,
    DateTime StartTime, DateTime EndTime, string Status,
    decimal TotalPrice, int XpEarned, string? Notes, DateTime CreatedAt,
    string? ZoneName, string? ZoneTier, string? WorkstationName, string? PackageName
);

public record CreateBookingRequest(
    [Required] Guid UserId,
    [Required] Guid WorkstationId,
    [Required] Guid ZoneId,
    Guid? PackageId,
    [Required] DateTime StartTime,
    [Required] DateTime EndTime,
    [Range(0, 99999)] decimal TotalPrice,
    [Range(0, 100000)] int XpEarned,
    string? Notes
);

public record UpdateBookingStatusRequest([Required] string Status);

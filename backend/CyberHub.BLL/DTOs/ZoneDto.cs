using System.ComponentModel.DataAnnotations;

namespace CyberHub.BLL.DTOs;

public record ZoneDto(
    Guid Id, string Name, string? Description, string Tier,
    decimal HourlyRate, int SeatCount, string? ImageUrl,
    bool IsActive, DateTime CreatedAt
);

public record CreateZoneRequest(
    [Required, MaxLength(100)] string Name,
    string? Description,
    [Required] string Tier,
    [Range(0, 99999)] decimal HourlyRate,
    [Range(1, 500)] int SeatCount,
    string? ImageUrl,
    bool IsActive = true
);

public record UpdateZoneRequest(
    [Required] Guid Id,
    [Required, MaxLength(100)] string Name,
    string? Description,
    [Required] string Tier,
    [Range(0, 99999)] decimal HourlyRate,
    [Range(1, 500)] int SeatCount,
    string? ImageUrl,
    bool IsActive
);

using System.ComponentModel.DataAnnotations;

namespace CyberHub.BLL.DTOs;

public record PackageDto(
    Guid Id, string Category, string Name, string? Description,
    decimal Price, int DurationMinutes, int XpReward,
    bool IsActive, DateTime CreatedAt
);

public record CreatePackageRequest(
    [Required] string Category,
    [Required, MaxLength(100)] string Name,
    string? Description,
    [Range(0, 99999)] decimal Price,
    [Range(1, 14400)] int DurationMinutes,
    [Range(0, 100000)] int XpReward,
    bool IsActive = true
);

public record UpdatePackageRequest(
    [Required] Guid Id,
    [Required] string Category,
    [Required, MaxLength(100)] string Name,
    string? Description,
    [Range(0, 99999)] decimal Price,
    [Range(1, 14400)] int DurationMinutes,
    [Range(0, 100000)] int XpReward,
    bool IsActive
);

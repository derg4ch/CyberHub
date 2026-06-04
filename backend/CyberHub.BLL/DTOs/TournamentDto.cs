using System.ComponentModel.DataAnnotations;

namespace CyberHub.BLL.DTOs;

public record TournamentDto(
    Guid Id, string Name, string? Game, string? Description,
    decimal PrizePool, decimal EntryFee,
    int MaxParticipants, int CurrentParticipants,
    DateTime? StartTime, string Status, string? ImageUrl, DateTime CreatedAt
);

public record CreateTournamentRequest(
    [Required, MaxLength(150)] string Name,
    [MaxLength(100)] string? Game,
    string? Description,
    [Range(0, 9999999)] decimal PrizePool,
    [Range(0, 99999)] decimal EntryFee,
    [Range(2, 10000)] int MaxParticipants,
    DateTime? StartTime,
    string Status = "Upcoming",
    string? ImageUrl = null
);

public record UpdateTournamentRequest(
    [Required] Guid Id,
    [Required, MaxLength(150)] string Name,
    [MaxLength(100)] string? Game,
    string? Description,
    [Range(0, 9999999)] decimal PrizePool,
    [Range(0, 99999)] decimal EntryFee,
    [Range(2, 10000)] int MaxParticipants,
    DateTime? StartTime,
    [Required] string Status,
    string? ImageUrl
);

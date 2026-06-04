using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CyberHub.DAL.Models;

/// <summary>Кіберспортивний турнір.</summary>
[Table("tournaments")]
public class Tournament
{
    [Key, Column("id")]
    public Guid Id { get; set; }

    [Required, MaxLength(150), Column("name")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(100), Column("game")]
    public string? Game { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("prize_pool"), Range(0, 9999999)]
    public decimal PrizePool { get; set; }

    [Column("entry_fee"), Range(0, 99999)]
    public decimal EntryFee { get; set; }

    [Column("max_participants"), Range(2, 10000)]
    public int MaxParticipants { get; set; } = 16;

    [Column("current_participants"), Range(0, 10000)]
    public int CurrentParticipants { get; set; }

    [Column("start_time")]
    public DateTime? StartTime { get; set; }

    /// <summary>Upcoming | Registration Open | In Progress | Completed</summary>
    [Required, Column("status")]
    public string Status { get; set; } = "Upcoming";

    [Column("image_url")]
    public string? ImageUrl { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}

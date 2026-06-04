using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CyberHub.DAL.Models;

/// <summary>Тарифний пакет для бронювання.</summary>
[Table("packages")]
public class Package
{
    [Key, Column("id")]
    public Guid Id { get; set; }

    /// <summary>Hourly | Daily | Night | Weekly | Tournament | VIP</summary>
    [Required, Column("category")]
    public string Category { get; set; } = "Hourly";

    [Required, MaxLength(100), Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [Column("price"), Range(0, 99999)]
    public decimal Price { get; set; }

    [Column("duration_minutes"), Range(1, 14400)]
    public int DurationMinutes { get; set; } = 60;

    [Column("xp_reward"), Range(0, 100000)]
    public int XpReward { get; set; } = 50;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}

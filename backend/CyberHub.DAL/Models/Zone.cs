using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CyberHub.DAL.Models;

/// <summary>Ігрова зона (клас приміщень).</summary>
[Table("zones")]
public class Zone
{
    [Key, Column("id")]
    public Guid Id { get; set; }

    [Required, MaxLength(100), Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    /// <summary>Tier: Standard | Pro | VIP | Streaming | VR</summary>
    [Required, Column("tier")]
    public string Tier { get; set; } = "Standard";

    [Column("hourly_rate"), Range(0, 99999)]
    public decimal HourlyRate { get; set; }

    [Column("seat_count"), Range(1, 500)]
    public int SeatCount { get; set; } = 10;

    [Column("image_url")]
    public string? ImageUrl { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    // Navigation
    public ICollection<Workstation> Workstations { get; set; } = [];
    public ICollection<Booking> Bookings { get; set; } = [];
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CyberHub.DAL.Models;

/// <summary>Окреме робоче місце (ПК / консоль) у зоні.</summary>
[Table("workstations")]
public class Workstation
{
    [Key, Column("id")]
    public Guid Id { get; set; }

    [Column("zone_id")]
    public Guid ZoneId { get; set; }

    [Required, MaxLength(50), Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("position_x")]
    public int PositionX { get; set; }

    [Column("position_y")]
    public int PositionY { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey(nameof(ZoneId))]
    public Zone? Zone { get; set; }
}

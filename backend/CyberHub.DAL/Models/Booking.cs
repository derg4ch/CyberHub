using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CyberHub.DAL.Models;

/// <summary>Бронювання робочого місця на сесію.</summary>
[Table("bookings")]
public class Booking
{
    [Key, Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("workstation_id")]
    public Guid WorkstationId { get; set; }

    [Column("zone_id")]
    public Guid ZoneId { get; set; }

    [Column("package_id")]
    public Guid? PackageId { get; set; }

    [Column("start_time")]
    public DateTime StartTime { get; set; }

    [Column("end_time")]
    public DateTime EndTime { get; set; }

    /// <summary>Pending | Confirmed | Active | Completed | Cancelled | No-Show</summary>
    [Required, Column("status")]
    public string Status { get; set; } = "Pending";

    [Column("total_price"), Range(0, 99999)]
    public decimal TotalPrice { get; set; }

    [Column("xp_earned"), Range(0, 100000)]
    public int XpEarned { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    // Navigation
    [ForeignKey(nameof(ZoneId))]
    public Zone? Zone { get; set; }

    [ForeignKey(nameof(WorkstationId))]
    public Workstation? Workstation { get; set; }

    [ForeignKey(nameof(PackageId))]
    public Package? Package { get; set; }
}

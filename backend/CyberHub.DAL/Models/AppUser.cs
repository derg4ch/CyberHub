using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CyberHub.DAL.Models;

[Table("users")]
public class AppUser
{
    [Key, Column("id")]
    public Guid Id { get; set; }

    [Required, Column("email")]
    public string Email { get; set; } = "";

    [Required, Column("password_hash")]
    public string PasswordHash { get; set; } = "";

    [Column("username")]
    public string? Username { get; set; }

    [Column("full_name")]
    public string? FullName { get; set; }

    [Column("phone_number")]
    public string? PhoneNumber { get; set; }

    [Column("avatar_url")]
    public string? AvatarUrl { get; set; }

    [Required, Column("role")]
    public string Role { get; set; } = "user";

    [Column("xp_points")]
    public int XpPoints { get; set; }

    [Column("level")]
    public int Level { get; set; } = 1;

    [Column("total_sessions")]
    public int TotalSessions { get; set; }

    [Column("total_hours")]
    public int TotalHours { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}

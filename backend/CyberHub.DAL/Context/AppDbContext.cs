using CyberHub.DAL.Models;
using Microsoft.EntityFrameworkCore;

namespace CyberHub.DAL.Context;

/// <summary>
/// Основний контекст EF Core для NEXUS Cyber Lounge.
/// Маппінг відповідає схемі Supabase (public).
/// </summary>
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Zone>        Zones        => Set<Zone>();
    public DbSet<Workstation> Workstations => Set<Workstation>();
    public DbSet<Package>     Packages     => Set<Package>();
    public DbSet<Booking>     Bookings     => Set<Booking>();
    public DbSet<Tournament>  Tournaments  => Set<Tournament>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.HasDefaultSchema("public");

        mb.Entity<Zone>(e =>
        {
            e.Property(z => z.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(z => z.CreatedAt).HasDefaultValueSql("now()");
            e.Property(z => z.HourlyRate).HasColumnType("numeric(10,2)");
            e.HasMany(z => z.Workstations).WithOne(w => w.Zone).HasForeignKey(w => w.ZoneId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(z => z.Bookings).WithOne(b => b.Zone).HasForeignKey(b => b.ZoneId).OnDelete(DeleteBehavior.Restrict);
        });

        mb.Entity<Workstation>(e =>
        {
            e.Property(w => w.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(w => w.CreatedAt).HasDefaultValueSql("now()");
        });

        mb.Entity<Package>(e =>
        {
            e.Property(p => p.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(p => p.CreatedAt).HasDefaultValueSql("now()");
            e.Property(p => p.Price).HasColumnType("numeric(10,2)");
        });

        mb.Entity<Booking>(e =>
        {
            e.Property(b => b.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(b => b.CreatedAt).HasDefaultValueSql("now()");
            e.Property(b => b.TotalPrice).HasColumnType("numeric(10,2)");
            e.HasIndex(b => new { b.WorkstationId, b.StartTime });
            e.HasIndex(b => b.UserId);
            e.HasIndex(b => b.Status);
        });

        mb.Entity<Tournament>(e =>
        {
            e.Property(t => t.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(t => t.CreatedAt).HasDefaultValueSql("now()");
            e.Property(t => t.PrizePool).HasColumnType("numeric(10,2)");
            e.Property(t => t.EntryFee).HasColumnType("numeric(10,2)");
        });
    }
}

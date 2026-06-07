using CyberHub.DAL.Context;
using CyberHub.DAL.Models;
using Microsoft.EntityFrameworkCore;

namespace CyberHub.API.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await db.Database.MigrateAsync();

        await SeedUsers(db);
        await SeedZones(db);
        await SeedPackages(db);
        await SeedTournaments(db);
    }

    // ─── Users ────────────────────────────────────────────────────────────────

    private static async Task SeedUsers(AppDbContext db)
    {
        if (await db.Users.AnyAsync()) return;

        db.Users.AddRange(
            new AppUser
            {
                Email        = "admin@cyberhub.ua",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("1234567890"),
                Username     = "admin",
                FullName     = "CyberHub Admin",
                Role         = "admin",
                XpPoints     = 9999,
                Level        = 10,
                TotalSessions= 150,
                TotalHours   = 420,
            },
            new AppUser
            {
                Email        = "vexpro@cyberhub.ua",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                Username     = "VexPro",
                FullName     = "Олексій Вернигора",
                Role         = "user",
                XpPoints     = 4750,
                Level        = 10,
                TotalSessions= 38,
                TotalHours   = 112,
            },
            new AppUser
            {
                Email        = "neonbyte@cyberhub.ua",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                Username     = "NeonByte",
                FullName     = "Дар'я Квіткова",
                Role         = "user",
                XpPoints     = 3200,
                Level        = 7,
                TotalSessions= 24,
                TotalHours   = 68,
            },
            new AppUser
            {
                Email        = "ghostframe@cyberhub.ua",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                Username     = "GhostFrame",
                FullName     = "Максим Рибаченко",
                Role         = "user",
                XpPoints     = 1500,
                Level        = 4,
                TotalSessions= 12,
                TotalHours   = 30,
            }
        );
        await db.SaveChangesAsync();
    }

    // ─── Zones ────────────────────────────────────────────────────────────────

    private static async Task SeedZones(AppDbContext db)
    {
        if (await db.Zones.AnyAsync()) return;

        var zones = new[]
        {
            new Zone
            {
                Id          = Guid.NewGuid(),
                Name        = "Standard Arena",
                Description = "Ідеальний старт для геймерів. 24 потужних ПК, комфортні крісла, швидкісний інтернет. Тут народжуються легенди.",
                Tier        = "Standard",
                HourlyRate  = 3.00m,
                SeatCount   = 24,
                ImageUrl    = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
                IsActive    = true,
            },
            new Zone
            {
                Id          = Guid.NewGuid(),
                Name        = "Pro Arena",
                Description = "240 Гц монітори, механічні клавіатури, мишки з 25600 DPI. Тут грають ті, хто хоче перемагати.",
                Tier        = "Pro",
                HourlyRate  = 6.00m,
                SeatCount   = 16,
                ImageUrl    = "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80",
                IsActive    = true,
            },
            new Zone
            {
                Id          = Guid.NewGuid(),
                Name        = "VIP Lounge",
                Description = "Приватні кабінки з OLED-дисплеями, RTX 4090, акустичною ізоляцією та персональним сервісом.",
                Tier        = "VIP",
                HourlyRate  = 12.00m,
                SeatCount   = 6,
                ImageUrl    = "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&q=80",
                IsActive    = true,
            },
            new Zone
            {
                Id          = Guid.NewGuid(),
                Name        = "Streaming Studio",
                Description = "Dual-PC setup, студійне освітлення, мікшер, хромакей. Твоя аудиторія чекає.",
                Tier        = "Streaming",
                HourlyRate  = 10.00m,
                SeatCount   = 4,
                ImageUrl    = "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&q=80",
                IsActive    = true,
            },
            new Zone
            {
                Id          = Guid.NewGuid(),
                Name        = "VR Zone",
                Description = "Meta Quest Pro, Valve Index, хаптик-костюми. Повне занурення у віртуальну реальність.",
                Tier        = "VR",
                HourlyRate  = 9.00m,
                SeatCount   = 8,
                ImageUrl    = "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80",
                IsActive    = true,
            },
        };

        db.Zones.AddRange(zones);
        await db.SaveChangesAsync();

        // Workstations per zone
        var workstations = new List<Workstation>();
        var seatCounts = new Dictionary<string, int>
        {
            ["Standard Arena"]   = 24,
            ["Pro Arena"]        = 16,
            ["VIP Lounge"]       = 6,
            ["Streaming Studio"] = 4,
            ["VR Zone"]          = 8,
        };

        foreach (var zone in zones)
        {
            int count = seatCounts[zone.Name];
            int cols  = zone.Tier == "VIP" ? 2 : zone.Tier == "Streaming" ? 2 : zone.Tier == "VR" ? 4 : 6;
            for (int i = 0; i < count; i++)
            {
                workstations.Add(new Workstation
                {
                    ZoneId    = zone.Id,
                    Name      = $"{zone.Tier[0]}{i + 1:D2}",
                    PositionX = (i % cols) * 120,
                    PositionY = (i / cols) * 100,
                    IsActive  = true,
                });
            }
        }

        db.Workstations.AddRange(workstations);
        await db.SaveChangesAsync();
    }

    // ─── Packages ─────────────────────────────────────────────────────────────

    private static async Task SeedPackages(AppDbContext db)
    {
        if (await db.Packages.AnyAsync()) return;

        db.Packages.AddRange(
            // Hourly
            new Package
            {
                Category        = "Hourly",
                Name            = "Старт — 1 година",
                Description     = "Ідеально для швидкої сесії після роботи. Без обмежень по іграх.",
                Price           = 3.00m,
                DurationMinutes = 60,
                XpReward        = 100,
                IsActive        = true,
            },
            new Package
            {
                Category        = "Hourly",
                Name            = "Стандарт — 2 години",
                Description     = "Найпопулярніший вибір. Часу вистачить на матч і ще один.",
                Price           = 5.00m,
                DurationMinutes = 120,
                XpReward        = 220,
                IsActive        = true,
            },
            new Package
            {
                Category        = "Hourly",
                Name            = "Марафон — 3 години",
                Description     = "Три години чистого гейму. Безкоштовний напій у подарунок.",
                Price           = 8.00m,
                DurationMinutes = 180,
                XpReward        = 360,
                IsActive        = true,
            },
            // Night
            new Package
            {
                Category        = "Night",
                Name            = "Нічний Рейд",
                Description     = "З 23:00 до 08:00. Максимум часу, мінімум ціна. Для справжніх нічних птахів.",
                Price           = 15.00m,
                DurationMinutes = 540,
                XpReward        = 800,
                IsActive        = true,
            },
            // Daily
            new Package
            {
                Category        = "Daily",
                Name            = "Денний Абонемент",
                Description     = "12 годин необмеженого доступу. Приходь коли хочеш протягом дня.",
                Price           = 25.00m,
                DurationMinutes = 720,
                XpReward        = 1200,
                IsActive        = true,
            },
            // VIP
            new Package
            {
                Category        = "VIP",
                Name            = "VIP — 2 години",
                Description     = "Приватна кабінка, RTX 4090, персональний сервіс, снеки включено.",
                Price           = 25.00m,
                DurationMinutes = 120,
                XpReward        = 600,
                IsActive        = true,
            },
            new Package
            {
                Category        = "VIP",
                Name            = "VIP — Нічний",
                Description     = "VIP-кабінка з 22:00 до 08:00. Повна приватність, максимальний комфорт.",
                Price           = 60.00m,
                DurationMinutes = 600,
                XpReward        = 2000,
                IsActive        = true,
            },
            // Tournament
            new Package
            {
                Category        = "Tournament",
                Name            = "Турнірна Сесія",
                Description     = "Спеціальний пакет для учасників турнірів. Включає доступ до Pro-зони.",
                Price           = 5.00m,
                DurationMinutes = 240,
                XpReward        = 500,
                IsActive        = true,
            }
        );
        await db.SaveChangesAsync();
    }

    // ─── Tournaments ──────────────────────────────────────────────────────────

    private static async Task SeedTournaments(AppDbContext db)
    {
        if (await db.Tournaments.AnyAsync()) return;

        var now = DateTime.UtcNow;

        db.Tournaments.AddRange(
            new Tournament
            {
                Name                = "NEXUS CS2 Open Cup",
                Game                = "Counter-Strike 2",
                Description         = "Відкритий турнір з CS2. 5v5, формат подвійного вибування. Призовий фонд гарантований.",
                PrizePool           = 300.00m,
                EntryFee            = 5.00m,
                MaxParticipants     = 32,
                CurrentParticipants = 18,
                StartTime           = now.AddDays(7),
                Status              = "Registration Open",
                ImageUrl            = "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=800&q=80",
            },
            new Tournament
            {
                Name                = "Dota 2 Championship",
                Game                = "Dota 2",
                Description         = "5v5 Single Elimination. Тільки для серйозних гравців. Реєстрація відкрита.",
                PrizePool           = 500.00m,
                EntryFee            = 8.00m,
                MaxParticipants     = 16,
                CurrentParticipants = 10,
                StartTime           = now.AddDays(14),
                Status              = "Registration Open",
                ImageUrl            = "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
            },
            new Tournament
            {
                Name                = "Valorant Weekly",
                Game                = "Valorant",
                Description         = "Щотижневий турнір. 5v5, Round Robin + Playoff. Новий сезон щопонеділка.",
                PrizePool           = 100.00m,
                EntryFee            = 3.00m,
                MaxParticipants     = 16,
                CurrentParticipants = 16,
                StartTime           = now.AddDays(2),
                Status              = "Upcoming",
                ImageUrl            = "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=800&q=80",
            },
            new Tournament
            {
                Name                = "FIFA 25 Kings League",
                Game                = "EA FC 25",
                Description         = "Турнір 1v1. Bracket система. Все вікові групи вітаються.",
                PrizePool           = 100.00m,
                EntryFee            = 3.00m,
                MaxParticipants     = 32,
                CurrentParticipants = 32,
                StartTime           = now.AddDays(-3),
                Status              = "In Progress",
                ImageUrl            = "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800&q=80",
            },
            new Tournament
            {
                Name                = "Mortal Kombat 1 Invitational",
                Game                = "Mortal Kombat 1",
                Description         = "Запрошений турнір для топ-гравців клубу. Тільки найкращі.",
                PrizePool           = 200.00m,
                EntryFee            = 0.00m,
                MaxParticipants     = 8,
                CurrentParticipants = 6,
                StartTime           = now.AddDays(21),
                Status              = "Registration Open",
                ImageUrl            = "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=800&q=80",
            },
            new Tournament
            {
                Name                = "NEXUS Spring Championship 2026",
                Game                = "Counter-Strike 2",
                Description         = "Великий весняний чемпіонат. Переможці отримують постійний VIP-статус.",
                PrizePool           = 1000.00m,
                EntryFee            = 15.00m,
                MaxParticipants     = 32,
                CurrentParticipants = 32,
                StartTime           = now.AddDays(-30),
                Status              = "Completed",
                ImageUrl            = "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&q=80",
            }
        );
        await db.SaveChangesAsync();
    }
}

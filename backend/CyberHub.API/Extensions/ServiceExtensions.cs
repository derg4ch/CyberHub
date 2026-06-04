using CyberHub.BLL.Interfaces;
using CyberHub.BLL.Mapping;
using CyberHub.BLL.Services;
using CyberHub.DAL.Context;
using CyberHub.DAL.Repositories.Implementations;
using CyberHub.DAL.Repositories.Interfaces;
using CyberHub.DAL.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace CyberHub.API.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddDatabase(
        this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<AppDbContext>(opt =>
            opt.UseNpgsql(config.GetConnectionString("DefaultConnection"),
                npg => npg.CommandTimeout(30))
            .UseSnakeCaseNamingConvention());
        return services;
    }

    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IZoneRepository,       ZoneRepository>();
        services.AddScoped<IPackageRepository,    PackageRepository>();
        services.AddScoped<IBookingRepository,    BookingRepository>();
        services.AddScoped<ITournamentRepository, TournamentRepository>();
        return services;
    }

    public static IServiceCollection AddUnitOfWork(this IServiceCollection services)
    {
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        return services;
    }

    public static IServiceCollection AddAppServices(this IServiceCollection services)
    {
        services.AddScoped<IZoneService,       ZoneService>();
        services.AddScoped<IPackageService,    PackageService>();
        services.AddScoped<IBookingService,    BookingService>();
        services.AddScoped<ITournamentService, TournamentService>();
        services.AddScoped<IAnalyticsService,  AnalyticsService>();
        return services;
    }

    public static IServiceCollection AddMappings(this IServiceCollection services)
    {
        MapsterConfig.Register();
        return services;
    }

    public static IServiceCollection AddSwaggerDocs(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title       = "NEXUS Cyber Lounge API",
                Version     = "v1",
                Description = "REST API системи управління комп'ютерним клубом NEXUS Cyber Lounge.\n\n" +
                              "Архітектура: DAL → BLL → API  |  БД: PostgreSQL + EF Core 8",
                Contact     = new OpenApiContact { Name = "derg4ch", Email = "derhach.maksym@chnu.edu.ua" },
            });
        });
        return services;
    }

    public static IServiceCollection AddCorsPolicy(this IServiceCollection services)
    {
        services.AddCors(opt =>
            opt.AddPolicy("FrontendPolicy", p =>
                p.WithOrigins("http://localhost:5173", "http://localhost:3000")
                 .AllowAnyHeader()
                 .AllowAnyMethod()));
        return services;
    }

    public static IServiceCollection AddJsonControllers(this IServiceCollection services)
    {
        services.AddControllers().AddJsonOptions(o =>
        {
            o.JsonSerializerOptions.PropertyNamingPolicy   = JsonNamingPolicy.CamelCase;
            o.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
            o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        });
        return services;
    }
}

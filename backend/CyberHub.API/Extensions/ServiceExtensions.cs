using System.Text;
using CyberHub.BLL.Interfaces;
using CyberHub.BLL.Mapping;
using CyberHub.BLL.Services;
using CyberHub.DAL.Context;
using CyberHub.DAL.Repositories.Implementations;
using CyberHub.DAL.Repositories.Interfaces;
using CyberHub.DAL.UnitOfWork;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
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
        services.AddScoped<IUserRepository,       UserRepository>();
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
        services.AddScoped<IAuthService,      AuthService>();
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

    public static IServiceCollection AddJwtAuth(
        this IServiceCollection services, IConfiguration config)
    {
        var key = Encoding.UTF8.GetBytes(config["Jwt:Key"]!);

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(opt =>
            {
                opt.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey         = new SymmetricSecurityKey(key),
                    ValidateIssuer           = true,
                    ValidIssuer              = config["Jwt:Issuer"],
                    ValidateAudience         = true,
                    ValidAudience            = config["Jwt:Audience"],
                    ValidateLifetime         = true,
                    ClockSkew                = TimeSpan.Zero,
                };
            });

        services.AddAuthorization();
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
                              "Архітектура: DAL → BLL → API  |  БД: PostgreSQL (Neon) + EF Core 8",
                Contact     = new OpenApiContact { Name = "derg4ch", Email = "derhach.maksym@chnu.edu.ua" },
            });

            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name         = "Authorization",
                Type         = SecuritySchemeType.Http,
                Scheme       = "bearer",
                BearerFormat = "JWT",
                In           = ParameterLocation.Header,
            });
            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
                    []
                }
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

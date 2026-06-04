using CyberHub.BLL.Interfaces;
using CyberHub.BLL.Services;
using CyberHub.DAL.Context;
using CyberHub.DAL.Repositories.Implementations;
using CyberHub.DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ── Database ────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npg => npg.CommandTimeout(30)
    )
    .UseSnakeCaseNamingConvention()
);

// ── DAL — Repositories ─────────────────────────────────────────
builder.Services.AddScoped<IZoneRepository,       ZoneRepository>();
builder.Services.AddScoped<IPackageRepository,    PackageRepository>();
builder.Services.AddScoped<IBookingRepository,    BookingRepository>();
builder.Services.AddScoped<ITournamentRepository, TournamentRepository>();

// ── BLL — Services ─────────────────────────────────────────────
builder.Services.AddScoped<IZoneService,       ZoneService>();
builder.Services.AddScoped<IPackageService,    PackageService>();
builder.Services.AddScoped<IBookingService,    BookingService>();
builder.Services.AddScoped<ITournamentService, TournamentService>();
builder.Services.AddScoped<IAnalyticsService,  AnalyticsService>();

// ── Controllers + JSON ─────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        o.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// ── Swagger / OpenAPI ──────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title       = "NEXUS Cyber Lounge API",
        Version     = "v1",
        Description = "REST API для системи управління комп'ютерним клубом NEXUS.\n\n" +
                      "**Архітектура:** DAL → BLL → API\n\n" +
                      "**БД:** PostgreSQL (Supabase) + Entity Framework Core 8",
        Contact = new OpenApiContact { Name = "NEXUS Dev Team" },
    });

    // Include XML comments if file exists
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath)) c.IncludeXmlComments(xmlPath);

    c.TagActionsBy(api => [api.GroupName ?? api.ActionDescriptor.RouteValues["controller"]!]);
});

// ── CORS ───────────────────────────────────────────────────────
builder.Services.AddCors(opt =>
    opt.AddPolicy("FrontendPolicy", p =>
        p.WithOrigins(
            "http://localhost:5173",
            "http://localhost:3000",
            "https://localhost:5173"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
    )
);

// ── Build ──────────────────────────────────────────────────────
var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "NEXUS Cyber Lounge API v1");
    c.RoutePrefix = "swagger";
    c.DocumentTitle = "NEXUS API Docs";
    c.DefaultModelsExpandDepth(-1); // collapse schemas by default
});

app.UseCors("FrontendPolicy");
app.UseAuthorization();
app.MapControllers();

// Health probe
app.MapGet("/health", () => Results.Ok(new { status = "ok", utc = DateTime.UtcNow }));

app.Run();

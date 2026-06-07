using CyberHub.API.Data;
using CyberHub.API.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddDatabase(builder.Configuration)
    .AddRepositories()
    .AddUnitOfWork()
    .AddAppServices()
    .AddMappings()
    .AddJwtAuth(builder.Configuration)
    .AddJsonControllers()
    .AddSwaggerDocs()
    .AddCorsPolicy();

var app = builder.Build();

await DbSeeder.SeedAsync(app.Services);

app.UseExceptionMiddleware()
   .UseSwaggerDocs();

app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok", utc = DateTime.UtcNow }));

app.Run();

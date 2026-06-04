using CyberHub.API.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddDatabase(builder.Configuration)
    .AddRepositories()
    .AddUnitOfWork()
    .AddAppServices()
    .AddMappings()
    .AddJsonControllers()
    .AddSwaggerDocs()
    .AddCorsPolicy();

var app = builder.Build();

app.UseExceptionMiddleware()
   .UseSwaggerDocs();

app.UseCors("FrontendPolicy");
app.UseAuthorization();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok", utc = DateTime.UtcNow }));

app.Run();

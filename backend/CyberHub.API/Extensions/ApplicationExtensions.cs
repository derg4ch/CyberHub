using CyberHub.API.Middleware;

namespace CyberHub.API.Extensions;

public static class ApplicationExtensions
{
    public static IApplicationBuilder UseExceptionMiddleware(this IApplicationBuilder app)
        => app.UseMiddleware<ExceptionMiddleware>();

    public static IApplicationBuilder UseSwaggerDocs(this IApplicationBuilder app)
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "NEXUS API v1");
            c.RoutePrefix            = "swagger";
            c.DocumentTitle          = "NEXUS Cyber Lounge API";
            c.DefaultModelsExpandDepth(-1);
        });
        return app;
    }
}

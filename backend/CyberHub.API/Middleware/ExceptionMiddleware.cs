using CyberHub.BLL.Exceptions;
using System.Text.Json;
using ValidationException = CyberHub.BLL.Exceptions.ValidationException;

namespace CyberHub.API.Middleware;

public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    private static readonly JsonSerializerOptions _json = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public async Task InvokeAsync(HttpContext ctx)
    {
        try
        {
            await next(ctx);
        }
        catch (NotFoundException ex)
        {
            logger.LogWarning(ex, "Resource not found: {Message}", ex.Message);
            await WriteAsync(ctx, StatusCodes.Status404NotFound,
                new ErrorResponse("NOT_FOUND", ex.Message));
        }
        catch (ValidationException ex)
        {
            logger.LogWarning(ex, "Validation failed");
            await WriteAsync(ctx, StatusCodes.Status422UnprocessableEntity,
                new ValidationErrorResponse("VALIDATION_ERROR", ex.Message, ex.Errors));
        }
        catch (BusinessException ex)
        {
            logger.LogWarning(ex, "Business rule violation: {Message}", ex.Message);
            await WriteAsync(ctx, StatusCodes.Status400BadRequest,
                new ErrorResponse("BUSINESS_ERROR", ex.Message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception");
            await WriteAsync(ctx, StatusCodes.Status500InternalServerError,
                new ErrorResponse("SERVER_ERROR", "An unexpected error occurred."));
        }
    }

    private static Task WriteAsync<T>(HttpContext ctx, int statusCode, T body)
    {
        ctx.Response.StatusCode  = statusCode;
        ctx.Response.ContentType = "application/json";
        return ctx.Response.WriteAsync(JsonSerializer.Serialize(body, _json));
    }
}

public record ErrorResponse(string Code, string Message);

public record ValidationErrorResponse(
    string Code,
    string Message,
    IReadOnlyDictionary<string, string[]> Errors);

using System.Text.Json;
using NoorTrading.Server.Common;

namespace NoorTrading.Server.Middleware;

/// <summary>
/// Gestion d'erreurs centralisée : convertit toute exception en réponse JSON
/// au format <see cref="ApiResponse"/> cohérent (success=false + message).
/// </summary>
public class ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
{
    private static readonly JsonSerializerOptions JsonOptions =
        new(JsonSerializerDefaults.Web);

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (AppException ex)
        {
            await WriteResponse(context, ex.StatusCode, ex.Message, ex.Errors);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erreur non gérée sur {Path}", context.Request.Path);
            await WriteResponse(context, StatusCodes.Status500InternalServerError,
                "Une erreur interne est survenue.", null);
        }
    }

    private static async Task WriteResponse(HttpContext context, int statusCode,
        string message, IEnumerable<string>? errors)
    {
        if (context.Response.HasStarted) return;

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var payload = ApiResponse.Fail(message, errors);
        await context.Response.WriteAsync(JsonSerializer.Serialize(payload, JsonOptions));
    }
}

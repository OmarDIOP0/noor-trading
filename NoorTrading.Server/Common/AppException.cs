namespace NoorTrading.Server.Common;

/// <summary>
/// Exception métier portant un code HTTP. Levée par la couche Services et
/// transformée en réponse JSON unifiée par <c>ErrorHandlingMiddleware</c>.
/// </summary>
public class AppException : Exception
{
    public int StatusCode { get; }
    public IEnumerable<string>? Errors { get; }

    public AppException(int statusCode, string message, IEnumerable<string>? errors = null)
        : base(message)
    {
        StatusCode = statusCode;
        Errors = errors;
    }

    public static AppException NotFound(string message = "Ressource introuvable") =>
        new(StatusCodes.Status404NotFound, message);

    public static AppException BadRequest(string message, IEnumerable<string>? errors = null) =>
        new(StatusCodes.Status400BadRequest, message, errors);

    public static AppException Unauthorized(string message = "Non autorisé") =>
        new(StatusCodes.Status401Unauthorized, message);

    public static AppException Conflict(string message) =>
        new(StatusCodes.Status409Conflict, message);
}

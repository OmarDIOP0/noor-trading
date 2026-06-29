namespace NoorTrading.Server.Common;

/// <summary>
/// Enveloppe de réponse unifiée consommée par l'intercepteur axios du frontend
/// (api/axios.ts) : il lit la clé <c>success</c> puis déballe <c>data</c>.
/// </summary>
public class ApiResponse<T>
{
    public bool Success { get; init; }
    public string? Message { get; init; }
    public T? Data { get; init; }
    public IEnumerable<string>? Errors { get; init; }

    public static ApiResponse<T> Ok(T data, string? message = null) =>
        new() { Success = true, Data = data, Message = message };

    public static ApiResponse<T> Fail(string message, IEnumerable<string>? errors = null) =>
        new() { Success = false, Message = message, Errors = errors };
}

/// <summary>Variante sans charge utile (suppression, actions).</summary>
public class ApiResponse : ApiResponse<object?>
{
    public static ApiResponse Ok(string? message = null) =>
        new() { Success = true, Message = message };

    public static new ApiResponse Fail(string message, IEnumerable<string>? errors = null) =>
        new() { Success = false, Message = message, Errors = errors };
}

/// <summary>Résultat paginé renvoyé dans <see cref="ApiResponse{T}.Data"/>.</summary>
public class Paged<T>
{
    public required IReadOnlyList<T> Items { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int Total { get; init; }
    public int TotalPages => PageSize <= 0 ? 0 : (int)Math.Ceiling(Total / (double)PageSize);
}

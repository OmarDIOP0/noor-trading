namespace NoorTrading.Server.Domain.Entities;

/// <summary>
/// Paramètres généraux de l'application (singleton, Id = 1). Centralise tout ce
/// qui était auparavant dupliqué en dur dans le frontend.
/// </summary>
public class AppSettings
{
    public int Id { get; set; } = 1;

    public string AppName { get; set; } = "NoorTrading";
    public string? LogoUrl { get; set; }
    public string MainTitle { get; set; } = string.Empty;   // titre principal page publique
    public string? AdminEmail { get; set; }

    /// <summary>URL publique de base (sert au QR code et au partage).</summary>
    public string PublicUrl { get; set; } = string.Empty;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

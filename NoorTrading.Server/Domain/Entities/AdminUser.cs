namespace NoorTrading.Server.Domain.Entities;

/// <summary>
/// Compte administrateur (unique propriétaire du portfolio). L'auth est gérée
/// par JWT + refresh token. Le mot de passe est stocké hashé (PBKDF2).
/// </summary>
public class AdminUser
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>Refresh token courant (rotation à chaque rafraîchissement).</summary>
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiresAtUtc { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

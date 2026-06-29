namespace NoorTrading.Server.Domain.Entities;

/// <summary>
/// Trace d'une visite de la page publique. Alimente les agrégats du dashboard.
/// Indexé sur <see cref="VisitedAtUtc"/> (+ index composite cible).
/// </summary>
public class VisitLog
{
    public long Id { get; set; }

    public DateTime VisitedAtUtc { get; set; } = DateTime.UtcNow;

    public string Page { get; set; } = "/";          // chemin visité
    public VisitSource Source { get; set; } = VisitSource.Direct;
    public string? Referrer { get; set; }

    // Cible optionnelle (pour les classements « top consultés »)
    public VisitTargetType TargetType { get; set; } = VisitTargetType.Other;
    public Guid? TargetId { get; set; }

    /// <summary>IP hashée (anti-spam / dédup), jamais l'IP en clair.</summary>
    public string? IpHash { get; set; }
}

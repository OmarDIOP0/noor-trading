namespace NoorTrading.Server.Domain.Entities;

/// <summary>Étape du parcours (CV animé) : formation, expérience, certification…</summary>
public class TimelineEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public TimelineType Type { get; set; } = TimelineType.Experience;
    public string Title { get; set; } = string.Empty;          // ex: "Ingénieure structure"
    public string? Organization { get; set; }                  // ex: "BET Concept"
    public string? Location { get; set; }

    /// <summary>Libellé de période libre (ex: "2019 — Aujourd'hui").</summary>
    public string Period { get; set; } = string.Empty;
    /// <summary>Année de début, pour le tri chronologique.</summary>
    public int? StartYear { get; set; }
    public bool IsCurrent { get; set; }

    public string? Description { get; set; }
    public int DisplayOrder { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

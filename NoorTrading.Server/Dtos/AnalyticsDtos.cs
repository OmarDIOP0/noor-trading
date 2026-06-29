using System.ComponentModel.DataAnnotations;
using NoorTrading.Server.Domain.Entities;

namespace NoorTrading.Server.Dtos;

/// <summary>Payload envoyé par la page PUBLIQUE à chaque chargement.</summary>
public class TrackVisitRequest
{
    [Required, MaxLength(300)] public string Page { get; set; } = "/";
    public string? Source { get; set; }                 // "qrcode" | "direct" | autre
    [MaxLength(500)] public string? Referrer { get; set; }
    public VisitTargetType? TargetType { get; set; }
    public Guid? TargetId { get; set; }
}

// ── Agrégats du dashboard ────────────────────────────────────────────────────
public record AnalyticsStats(
    int TotalVisits,
    int VisitsLast7Days,
    int TotalProjects,
    int ActiveServices,
    DateTime? LastContentUpdateUtc,
    IReadOnlyList<TimePoint> Timeline,
    IReadOnlyList<CategorySlice> ProjectsByCategory,
    IReadOnlyList<SourceSlice> VisitsBySource,
    IReadOnlyList<TopItem> TopConsulted);

public record TimePoint(string Date, int Visits);
public record CategorySlice(string Category, int Count);
public record SourceSlice(string Source, int Count);
public record TopItem(Guid? Id, string Label, string Type, int Visits);

public enum StatsRange { Last7Days, Last30Days, All }

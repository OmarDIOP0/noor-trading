using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using NoorTrading.Server.Data;
using NoorTrading.Server.Domain.Entities;
using NoorTrading.Server.Dtos;

namespace NoorTrading.Server.Services;

public interface IAnalyticsService
{
    Task TrackVisitAsync(TrackVisitRequest req, string? ip);
    Task<AnalyticsStats> GetStatsAsync(StatsRange range);
}

public class AnalyticsService(NoorTradingDbContext db) : IAnalyticsService
{
    // ── Enregistrement d'une visite (public) ─────────────────────────────────────
    public async Task TrackVisitAsync(TrackVisitRequest req, string? ip)
    {
        var log = new VisitLog
        {
            VisitedAtUtc = DateTime.UtcNow,
            Page = string.IsNullOrWhiteSpace(req.Page) ? "/" : req.Page.Trim(),
            Source = ParseSource(req.Source),
            Referrer = req.Referrer,
            TargetType = req.TargetType ?? VisitTargetType.Other,
            TargetId = req.TargetId,
            IpHash = HashIp(ip),
        };
        db.VisitLogs.Add(log);
        await db.SaveChangesAsync();
    }

    // ── Agrégats du dashboard (group by côté SQL) ────────────────────────────────
    public async Task<AnalyticsStats> GetStatsAsync(StatsRange range)
    {
        var now = DateTime.UtcNow;
        DateTime? from = range switch
        {
            StatsRange.Last7Days => now.AddDays(-7),
            StatsRange.Last30Days => now.AddDays(-30),
            _ => null,
        };

        var visits = db.VisitLogs.AsNoTracking();
        var scoped = from is null ? visits : visits.Where(v => v.VisitedAtUtc >= from);

        var totalVisits = await scoped.CountAsync();
        var since7 = now.AddDays(-7);
        var visitsLast7 = await visits.Where(v => v.VisitedAtUtc >= since7).CountAsync();

        // Timeline : nombre de visites par jour (group by SQL)
        var timelineRaw = await scoped
            .GroupBy(v => v.VisitedAtUtc.Date)
            .Select(g => new { Day = g.Key, Count = g.Count() })
            .OrderBy(x => x.Day)
            .ToListAsync();
        var timeline = timelineRaw
            .Select(x => new TimePoint(x.Day.ToString("yyyy-MM-dd"), x.Count))
            .ToList();

        // Visites par source (group by SQL)
        var bySource = await scoped
            .GroupBy(v => v.Source)
            .Select(g => new { Source = g.Key, Count = g.Count() })
            .ToListAsync();
        var visitsBySource = bySource
            .Select(x => new SourceSlice(x.Source.ToString(), x.Count))
            .ToList();

        // Réalisations par catégorie (group by SQL)
        var byCategory = await db.Projects.AsNoTracking()
            .GroupBy(p => p.Category)
            .Select(g => new { Category = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .ToListAsync();
        var projectsByCategory = byCategory
            .Select(x => new CategorySlice(string.IsNullOrEmpty(x.Category) ? "Non classé" : x.Category, x.Count))
            .ToList();

        // Top 5 consultés (projets + services) — group by SQL puis jointure des libellés
        var topGroups = await scoped
            .Where(v => v.TargetId != null
                && (v.TargetType == VisitTargetType.Project || v.TargetType == VisitTargetType.Service))
            .GroupBy(v => new { v.TargetType, v.TargetId })
            .Select(g => new { g.Key.TargetType, g.Key.TargetId, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(5)
            .ToListAsync();

        var projectIds = topGroups.Where(g => g.TargetType == VisitTargetType.Project)
            .Select(g => g.TargetId!.Value).ToList();
        var serviceIds = topGroups.Where(g => g.TargetType == VisitTargetType.Service)
            .Select(g => g.TargetId!.Value).ToList();

        var projectLabels = await db.Projects.AsNoTracking()
            .Where(p => projectIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, p => p.Title);
        var serviceLabels = await db.Services.AsNoTracking()
            .Where(s => serviceIds.Contains(s.Id))
            .ToDictionaryAsync(s => s.Id, s => s.Title);

        var topConsulted = topGroups.Select(g =>
        {
            var label = g.TargetType == VisitTargetType.Project
                ? projectLabels.GetValueOrDefault(g.TargetId!.Value, "(supprimé)")
                : serviceLabels.GetValueOrDefault(g.TargetId!.Value, "(supprimé)");
            return new TopItem(g.TargetId, label, g.TargetType.ToString(), g.Count);
        }).ToList();

        // Compteurs de contenu
        var totalProjects = await db.Projects.CountAsync();
        var activeServices = await db.Services.CountAsync(s => s.IsActive);

        // Dernière mise à jour de contenu (profil / projets / services / settings)
        var lastUpdate = await ComputeLastUpdateAsync();

        return new AnalyticsStats(
            totalVisits, visitsLast7, totalProjects, activeServices, lastUpdate,
            timeline, projectsByCategory, visitsBySource, topConsulted);
    }

    private async Task<DateTime?> ComputeLastUpdateAsync()
    {
        var dates = new List<DateTime?>
        {
            await db.Profiles.MaxAsync(p => (DateTime?)p.UpdatedAtUtc),
            await db.Projects.MaxAsync(p => (DateTime?)p.UpdatedAtUtc),
            await db.Services.MaxAsync(s => (DateTime?)s.UpdatedAtUtc),
            await db.AppSettings.MaxAsync(s => (DateTime?)s.UpdatedAtUtc),
        };
        return dates.Where(d => d.HasValue).DefaultIfEmpty(null).Max();
    }

    private static VisitSource ParseSource(string? source) => source?.Trim().ToLowerInvariant() switch
    {
        "qrcode" or "qr" => VisitSource.QrCode,
        "direct" or null or "" => VisitSource.Direct,
        _ => VisitSource.Other,
    };

    private static string? HashIp(string? ip)
    {
        if (string.IsNullOrWhiteSpace(ip)) return null;
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes("noortrading-salt:" + ip));
        return Convert.ToHexString(bytes)[..16];
    }
}

using Microsoft.EntityFrameworkCore;
using NoorTrading.Server.Common;
using NoorTrading.Server.Data;
using NoorTrading.Server.Domain.Entities;
using NoorTrading.Server.Dtos;

namespace NoorTrading.Server.Services;

/// <summary>
/// Lecture seule pour la vitrine publique : ne renvoie que le contenu publié /
/// actif, et masque les champs internes.
/// </summary>
public interface IPublicContentService
{
    Task<PublicBundleDto> GetBundleAsync();
    Task<IReadOnlyList<PublicServiceDto>> GetServicesAsync();
    Task<IReadOnlyList<PublicProjectDto>> GetProjectsAsync(string? category);
    Task<PublicProjectDto> GetProjectAsync(Guid id);
    Task<IReadOnlyList<TimelineEntryDto>> GetTimelineAsync();
}

public class PublicContentService(NoorTradingDbContext db) : IPublicContentService
{
    public async Task<PublicBundleDto> GetBundleAsync()
    {
        var settings = await db.AppSettings.AsNoTracking().FirstOrDefaultAsync(x => x.Id == 1)
                       ?? new AppSettings();
        var profile = await db.Profiles.AsNoTracking().Include(p => p.SocialLinks)
                          .FirstOrDefaultAsync(p => p.Id == 1) ?? new Profile();
        var services = await GetServicesAsync();
        var timeline = await GetTimelineAsync();

        return new PublicBundleDto(MapSettings(settings), MapProfile(profile), services, timeline);
    }

    public async Task<IReadOnlyList<PublicServiceDto>> GetServicesAsync()
    {
        var items = await db.Services.AsNoTracking()
            .Where(s => s.IsActive)
            .OrderBy(s => s.DisplayOrder).ThenBy(s => s.Title)
            .ToListAsync();
        return items.Select(s => new PublicServiceDto(
            s.Id, s.Title, s.ShortDescription, s.Icon, s.Domain, s.DisplayOrder)).ToList();
    }

    public async Task<IReadOnlyList<PublicProjectDto>> GetProjectsAsync(string? category)
    {
        var query = db.Projects.AsNoTracking().Include(p => p.Images)
            .Where(p => p.Status == ProjectStatus.Published);
        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(p => p.Category == category);

        var items = await query
            .OrderBy(p => p.DisplayOrder).ThenByDescending(p => p.Year ?? 0)
            .ToListAsync();
        return items.Select(MapProject).ToList();
    }

    public async Task<PublicProjectDto> GetProjectAsync(Guid id)
    {
        var p = await db.Projects.AsNoTracking().Include(x => x.Images)
            .FirstOrDefaultAsync(x => x.Id == id && x.Status == ProjectStatus.Published)
            ?? throw AppException.NotFound("Réalisation introuvable.");
        return MapProject(p);
    }

    public async Task<IReadOnlyList<TimelineEntryDto>> GetTimelineAsync()
    {
        var items = await db.TimelineEntries.AsNoTracking()
            .OrderBy(t => t.DisplayOrder).ThenByDescending(t => t.StartYear ?? 0)
            .ToListAsync();
        return items.Select(t => new TimelineEntryDto(
            t.Id, t.Type, t.Title, t.Organization, t.Location, t.Period,
            t.StartYear, t.IsCurrent, t.Description, t.DisplayOrder)).ToList();
    }

    private static PublicSettingsDto MapSettings(AppSettings s) =>
        new(s.AppName, s.LogoUrl, s.MainTitle, s.PublicUrl);

    private static PublicProfileDto MapProfile(Profile p) => new(
        p.FullName, p.Title, p.Bio, p.PhotoUrl, p.Email, p.Phone, p.Location,
        p.SocialLinks.OrderBy(s => s.DisplayOrder)
            .Select(s => new SocialLinkDto(s.Id, s.Label, s.Url, s.Icon, s.DisplayOrder)).ToList());

    private static PublicProjectDto MapProject(Project p)
    {
        var images = p.Images.OrderBy(i => i.SortOrder)
            .Select(i => new ProjectImageDto(i.Id, i.Url, i.SortOrder, i.IsCover, i.Phase)).ToList();
        var cover = p.Images.FirstOrDefault(i => i.IsCover)?.Url
                    ?? p.Images.Where(i => i.Phase == ImagePhase.Apres).OrderBy(i => i.SortOrder).FirstOrDefault()?.Url
                    ?? images.FirstOrDefault()?.Url;
        return new PublicProjectDto(
            p.Id, p.Title, p.Description, p.Category, p.Year, p.Surface, p.Client,
            cover, p.DisplayOrder, images);
    }
}

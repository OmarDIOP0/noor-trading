using NoorTrading.Server.Domain.Entities;

namespace NoorTrading.Server.Dtos;

/// <summary>Profil exposé publiquement (mêmes champs que l'admin, sans secret).</summary>
public record PublicProfileDto(
    string FullName,
    string Title,
    string Bio,
    string? PhotoUrl,
    string? Email,
    string? Phone,
    string? Location,
    IReadOnlyList<SocialLinkDto> SocialLinks);

public record PublicServiceDto(
    Guid Id,
    string Title,
    string ShortDescription,
    string Icon,
    ServiceDomain Domain,
    int DisplayOrder);

public record PublicProjectDto(
    Guid Id,
    string Title,
    string Description,
    string Category,
    int? Year,
    string? Surface,
    string? Client,
    string? CoverImageUrl,
    int DisplayOrder,
    IReadOnlyList<ProjectImageDto> Images);

/// <summary>Paramètres publics — sans l'e-mail admin ni autre donnée interne.</summary>
public record PublicSettingsDto(
    string AppName,
    string? LogoUrl,
    string MainTitle,
    string PublicUrl);

/// <summary>Agrégat « tout le contenu public » pour un chargement initial unique.</summary>
public record PublicBundleDto(
    PublicSettingsDto Settings,
    PublicProfileDto Profile,
    IReadOnlyList<PublicServiceDto> Services,
    IReadOnlyList<TimelineEntryDto> Timeline);

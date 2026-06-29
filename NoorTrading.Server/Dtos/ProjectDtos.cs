using System.ComponentModel.DataAnnotations;
using NoorTrading.Server.Domain.Entities;

namespace NoorTrading.Server.Dtos;

public record ProjectImageDto(Guid Id, string Url, int SortOrder, bool IsCover, ImagePhase Phase);

public record ProjectDto(
    Guid Id,
    string Title,
    string Description,
    string Category,
    int? Year,
    string? Surface,
    string? Client,
    ProjectStatus Status,
    int DisplayOrder,
    string? CoverImageUrl,
    DateTime UpdatedAtUtc,
    IReadOnlyList<ProjectImageDto> Images);

public class CreateProjectRequest
{
    [Required, MaxLength(200)] public string Title { get; set; } = string.Empty;
    [MaxLength(8000)] public string Description { get; set; } = string.Empty;
    [Required, MaxLength(80)] public string Category { get; set; } = string.Empty;
    [Range(1900, 2100)] public int? Year { get; set; }
    [MaxLength(60)] public string? Surface { get; set; }
    [MaxLength(160)] public string? Client { get; set; }
    public ProjectStatus Status { get; set; } = ProjectStatus.Draft;
    public int DisplayOrder { get; set; }
}

public class UpdateProjectRequest
{
    [Required, MaxLength(200)] public string Title { get; set; } = string.Empty;
    [MaxLength(8000)] public string Description { get; set; } = string.Empty;
    [Required, MaxLength(80)] public string Category { get; set; } = string.Empty;
    [Range(1900, 2100)] public int? Year { get; set; }
    [MaxLength(60)] public string? Surface { get; set; }
    [MaxLength(160)] public string? Client { get; set; }
    public ProjectStatus Status { get; set; } = ProjectStatus.Draft;
    public int DisplayOrder { get; set; }
}

public record ProjectsFilter(string? Category, ProjectStatus? Status, int Page = 1, int PageSize = 20);

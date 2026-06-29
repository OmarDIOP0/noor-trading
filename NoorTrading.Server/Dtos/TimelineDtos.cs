using System.ComponentModel.DataAnnotations;
using NoorTrading.Server.Domain.Entities;

namespace NoorTrading.Server.Dtos;

public record TimelineEntryDto(
    Guid Id,
    TimelineType Type,
    string Title,
    string? Organization,
    string? Location,
    string Period,
    int? StartYear,
    bool IsCurrent,
    string? Description,
    int DisplayOrder);

public class TimelineEntryInput
{
    public TimelineType Type { get; set; } = TimelineType.Experience;
    [Required, MaxLength(200)] public string Title { get; set; } = string.Empty;
    [MaxLength(200)] public string? Organization { get; set; }
    [MaxLength(160)] public string? Location { get; set; }
    [Required, MaxLength(80)] public string Period { get; set; } = string.Empty;
    [Range(1900, 2100)] public int? StartYear { get; set; }
    public bool IsCurrent { get; set; }
    [MaxLength(2000)] public string? Description { get; set; }
    public int DisplayOrder { get; set; }
}

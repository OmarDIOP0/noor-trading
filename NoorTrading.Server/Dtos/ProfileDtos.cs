using System.ComponentModel.DataAnnotations;

namespace NoorTrading.Server.Dtos;

public record ProfileDto(
    string FullName,
    string Title,
    string Bio,
    string? PhotoUrl,
    string? Email,
    string? Phone,
    string? Location,
    DateTime UpdatedAtUtc,
    IReadOnlyList<SocialLinkDto> SocialLinks);

public record SocialLinkDto(Guid Id, string Label, string Url, string? Icon, int DisplayOrder);

public class UpdateProfileRequest
{
    [Required, MaxLength(160)] public string FullName { get; set; } = string.Empty;
    [Required, MaxLength(160)] public string Title { get; set; } = string.Empty;
    [MaxLength(4000)] public string Bio { get; set; } = string.Empty;
    [EmailAddress] public string? Email { get; set; }
    [MaxLength(40)] public string? Phone { get; set; }
    [MaxLength(160)] public string? Location { get; set; }
    public List<SocialLinkInput>? SocialLinks { get; set; }
}

public class SocialLinkInput
{
    [Required, MaxLength(80)] public string Label { get; set; } = string.Empty;
    [Required, Url, MaxLength(500)] public string Url { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public int DisplayOrder { get; set; }
}

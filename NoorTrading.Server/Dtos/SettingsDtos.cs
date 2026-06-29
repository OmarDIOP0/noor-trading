using System.ComponentModel.DataAnnotations;

namespace NoorTrading.Server.Dtos;

public record AppSettingsDto(
    string AppName,
    string? LogoUrl,
    string MainTitle,
    string? AdminEmail,
    string PublicUrl,
    DateTime UpdatedAtUtc);

public class UpdateSettingsRequest
{
    [Required, MaxLength(120)] public string AppName { get; set; } = string.Empty;
    [Required, MaxLength(200)] public string MainTitle { get; set; } = string.Empty;
    [EmailAddress] public string? AdminEmail { get; set; }
    [Required, Url, MaxLength(300)] public string PublicUrl { get; set; } = string.Empty;
}

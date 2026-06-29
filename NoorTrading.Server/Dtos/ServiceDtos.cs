using System.ComponentModel.DataAnnotations;
using NoorTrading.Server.Domain.Entities;

namespace NoorTrading.Server.Dtos;

public record ServiceDto(
    Guid Id,
    string Title,
    string ShortDescription,
    string Icon,
    ServiceDomain Domain,
    int DisplayOrder,
    bool IsActive,
    DateTime UpdatedAtUtc);

public class CreateServiceRequest
{
    [Required, MaxLength(160)] public string Title { get; set; } = string.Empty;
    [Required, MaxLength(600)] public string ShortDescription { get; set; } = string.Empty;
    [Required, MaxLength(60)] public string Icon { get; set; } = "HardHat";
    public ServiceDomain Domain { get; set; } = ServiceDomain.GenieCivil;
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateServiceRequest
{
    [Required, MaxLength(160)] public string Title { get; set; } = string.Empty;
    [Required, MaxLength(600)] public string ShortDescription { get; set; } = string.Empty;
    [Required, MaxLength(60)] public string Icon { get; set; } = "HardHat";
    public ServiceDomain Domain { get; set; } = ServiceDomain.GenieCivil;
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

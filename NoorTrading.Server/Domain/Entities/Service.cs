namespace NoorTrading.Server.Domain.Entities;

/// <summary>Service / prestation proposé (ex: VRD, Études de sol, Supervision).</summary>
public class Service
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Title { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string Icon { get; set; } = "HardHat";   // nom d'icône lucide-react

    /// <summary>Univers du service (génie civil / décoration / les deux).</summary>
    public ServiceDomain Domain { get; set; } = ServiceDomain.GenieCivil;

    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

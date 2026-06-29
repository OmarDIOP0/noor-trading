namespace NoorTrading.Server.Domain.Entities;

/// <summary>
/// Profil public de l'ingénieur / propriétaire du portfolio. Singleton logique
/// (une seule ligne, Id = 1).
/// </summary>
public class Profile
{
    public int Id { get; set; } = 1;

    public string FullName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;        // ex: "Ingénieur Génie Civil"
    public string Bio { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }

    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Location { get; set; }

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public List<SocialLink> SocialLinks { get; set; } = [];
}

/// <summary>Lien réseau social / externe rattaché au profil.</summary>
public class SocialLink
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public int ProfileId { get; set; }
    public string Label { get; set; } = string.Empty;   // ex: "LinkedIn"
    public string Url { get; set; } = string.Empty;
    public string? Icon { get; set; }                   // nom d'icône lucide (optionnel)
    public int DisplayOrder { get; set; }

    public Profile? Profile { get; set; }
}

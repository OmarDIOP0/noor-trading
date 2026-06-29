namespace NoorTrading.Server.Domain.Entities;

/// <summary>Réalisation / projet du portfolio (avec galerie d'images 1-N).</summary>
public class Project
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;   // ex: VRD, Bâtiment, Études de sol

    // Champs optionnels typiques BTP
    public int? Year { get; set; }
    public string? Surface { get; set; }    // ex: "1 200 m²"
    public string? Client { get; set; }

    public ProjectStatus Status { get; set; } = ProjectStatus.Draft;
    public int DisplayOrder { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public List<ProjectImage> Images { get; set; } = [];
}

/// <summary>Image rattachée à une réalisation (stockée dans wwwroot/uploads/projets/{projectId}).</summary>
public class ProjectImage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProjectId { get; set; }

    public string Url { get; set; } = string.Empty;        // chemin relatif servi statiquement
    public string FileName { get; set; } = string.Empty;   // nom GUID sur disque
    public int SortOrder { get; set; }
    public bool IsCover { get; set; }

    /// <summary>Phase : après travaux (défaut) ou avant.</summary>
    public ImagePhase Phase { get; set; } = ImagePhase.Apres;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public Project? Project { get; set; }
}

namespace NoorTrading.Server.Domain.Entities;

public enum ProjectStatus
{
    Draft = 0,
    Published = 1,
}

/// <summary>Origine d'une visite, déduite du query param <c>?source=</c>.</summary>
public enum VisitSource
{
    Direct = 0,
    QrCode = 1,
    Other = 2,
}

/// <summary>Type de cible d'une visite, pour les agrégats « top consultés ».</summary>
public enum VisitTargetType
{
    Other = 0,
    Home = 1,
    Project = 2,
    Service = 3,
}

/// <summary>Univers d'un service : génie civil, décoration intérieure, ou les deux.</summary>
public enum ServiceDomain
{
    GenieCivil = 0,
    Decoration = 1,
    Both = 2,
}

/// <summary>Nature d'une étape de parcours (CV).</summary>
public enum TimelineType
{
    Experience = 0,
    Education = 1,
    Certification = 2,
    Achievement = 3,
}

/// <summary>Phase d'une image de réalisation : après travaux (défaut) ou avant.</summary>
public enum ImagePhase
{
    Apres = 0,
    Avant = 1,
}

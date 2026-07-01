using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;

namespace NoorTrading.Server.Data;

/// <summary>
/// Migration unique des données SQLite → SQL Server.
/// Lance via :  dotnet run -- migrate-data
/// Lit l'ancienne base SQLite et réinjecte toutes les lignes dans SQL Server.
/// </summary>
public static class DataMigrator
{
    public static async Task RunAsync(IServiceProvider _, IConfiguration config)
    {
        var sqlitePath = config["SqliteSourcePath"] ?? "noortrading.db";
        var sqlServerConn = config.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' manquante.");

        if (!File.Exists(sqlitePath))
        {
            Console.WriteLine($"❌ Base SQLite introuvable : {Path.GetFullPath(sqlitePath)}");
            Console.WriteLine("   Définis le chemin via la clé de config 'SqliteSourcePath' si besoin.");
            return;
        }

        var sqliteOptions = new DbContextOptionsBuilder<NoorTradingDbContext>()
            .UseSqlite($"Data Source={sqlitePath}").Options;
        var sqlOptions = new DbContextOptionsBuilder<NoorTradingDbContext>()
            .UseSqlServer(sqlServerConn).Options;

        Console.WriteLine($"Source SQLite     : {Path.GetFullPath(sqlitePath)}");
        Console.WriteLine($"Cible  SQL Server : {MaskPassword(sqlServerConn)}");

        await using var src = new NoorTradingDbContext(sqliteOptions);
        await using var dst = new NoorTradingDbContext(sqlOptions);

        // 1) Applique le schéma cible (migrations) — sans seed.
        Console.WriteLine("\nApplication des migrations sur SQL Server…");
        await dst.Database.MigrateAsync();

        // 2) Garde-fou anti-doublon : la cible doit être vierge de données métier.
        if (await dst.Profiles.AnyAsync() || await dst.Projects.AnyAsync()
            || await dst.Services.AnyAsync() || await dst.AdminUsers.AnyAsync())
        {
            Console.WriteLine("\n⚠  La base cible contient déjà des données — migration ANNULÉE (anti-doublon).");
            Console.WriteLine("   Vide les tables cibles avant de relancer si tu veux ré-importer.");
            return;
        }

        // 3) Lecture depuis SQLite (no-tracking, enfants inclus).
        Console.WriteLine("Lecture des données SQLite…");
        var admins = await src.AdminUsers.AsNoTracking().ToListAsync();
        var appSettings = await src.AppSettings.AsNoTracking().ToListAsync();
        var services = await src.Services.AsNoTracking().ToListAsync();
        var timeline = await src.TimelineEntries.AsNoTracking().ToListAsync();
        var profiles = await src.Profiles.AsNoTracking().Include(p => p.SocialLinks).ToListAsync();
        var projects = await src.Projects.AsNoTracking().Include(p => p.Images).ToListAsync();
        var visits = await src.VisitLogs.AsNoTracking().ToListAsync();

        // 4) Insertion dans l'ordre des dépendances. Les clés Guid + singletons int
        //    sont ValueGeneratedNever → valeurs (et FK) préservées telles quelles.
        dst.AdminUsers.AddRange(admins);
        dst.AppSettings.AddRange(appSettings);
        dst.Services.AddRange(services);
        dst.TimelineEntries.AddRange(timeline);
        dst.Profiles.AddRange(profiles);     // + SocialLinks (cascade navigation)
        dst.Projects.AddRange(projects);     // + ProjectImages (cascade navigation)

        // VisitLog.Id = bigint IDENTITY → on laisse SQL Server réattribuer (aucune FK ne le référence).
        foreach (var v in visits) v.Id = 0;
        dst.VisitLogs.AddRange(visits);

        Console.WriteLine("Écriture dans SQL Server…");
        await dst.SaveChangesAsync();

        // 5) Vérification : comptage par table.
        Console.WriteLine("\n── Lignes migrées (vérification) ──────────────");
        Console.WriteLine($"  AdminUsers      : {await dst.AdminUsers.CountAsync()}");
        Console.WriteLine($"  AppSettings     : {await dst.AppSettings.CountAsync()}");
        Console.WriteLine($"  Profiles        : {await dst.Profiles.CountAsync()}");
        Console.WriteLine($"  SocialLinks     : {await dst.SocialLinks.CountAsync()}");
        Console.WriteLine($"  Services        : {await dst.Services.CountAsync()}");
        Console.WriteLine($"  Projects        : {await dst.Projects.CountAsync()}");
        Console.WriteLine($"  ProjectImages   : {await dst.ProjectImages.CountAsync()}");
        Console.WriteLine($"  TimelineEntries : {await dst.TimelineEntries.CountAsync()}");
        Console.WriteLine($"  VisitLogs       : {await dst.VisitLogs.CountAsync()}");
        Console.WriteLine("── Migration des données terminée ✔ ───────────");
    }

    private static string MaskPassword(string cs) =>
        Regex.Replace(cs, "(?i)(Password|Pwd)=[^;]*", "$1=***");
}

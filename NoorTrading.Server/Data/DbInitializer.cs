using Microsoft.EntityFrameworkCore;
using NoorTrading.Server.Common;
using NoorTrading.Server.Domain.Entities;

namespace NoorTrading.Server.Data;

/// <summary>
/// Applique les migrations au démarrage et amorce les singletons (Profile,
/// AppSettings) + un compte admin par défaut issu de la configuration.
/// </summary>
public static class DbInitializer
{
    public static async Task InitializeAsync(IServiceProvider services, IConfiguration config)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NoorTradingDbContext>();

        await db.Database.MigrateAsync();

        if (!await db.AppSettings.AnyAsync())
        {
            db.AppSettings.Add(new AppSettings
            {
                Id = 1,
                AppName = "NoorTrading",
                MainTitle = "Génie Civil & BTP — Portfolio",
                PublicUrl = config["PublicUrl"] ?? "https://aissatoufall.noorglobaltrading.net",
            });
        }

        if (!await db.Profiles.AnyAsync())
        {
            db.Profiles.Add(new Profile
            {
                Id = 1,
                FullName = "Ingénieur Génie Civil",
                Title = "Ingénieur Génie Civil",
                Bio = "",
            });
        }

        if (!await db.AdminUsers.AnyAsync())
        {
            var email = config["DefaultAdmin:Email"] ?? "admin@noortrading.local";
            var password = config["DefaultAdmin:Password"] ?? "Admin123!";
            db.AdminUsers.Add(new AdminUser
            {
                Email = email,
                FullName = "Administrateur",
                PasswordHash = PasswordHasher.Hash(password),
            });
        }

        await db.SaveChangesAsync();
    }
}

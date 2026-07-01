using Microsoft.EntityFrameworkCore;
using NoorTrading.Server.Domain.Entities;

namespace NoorTrading.Server.Data;

public class NoorTradingDbContext(DbContextOptions<NoorTradingDbContext> options) : DbContext(options)
{
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
    public DbSet<Profile> Profiles => Set<Profile>();
    public DbSet<SocialLink> SocialLinks => Set<SocialLink>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectImage> ProjectImages => Set<ProjectImage>();
    public DbSet<AppSettings> AppSettings => Set<AppSettings>();
    public DbSet<VisitLog> VisitLogs => Set<VisitLog>();
    public DbSet<TimelineEntry> TimelineEntries => Set<TimelineEntry>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        // ── AdminUser ────────────────────────────────────────────────────────
        b.Entity<AdminUser>(e =>
        {
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Id).ValueGeneratedNever();
            e.Property(x => x.Email).HasMaxLength(256).IsRequired();
            e.Property(x => x.FullName).HasMaxLength(160);
        });

        // ── Profile + SocialLink ─────────────────────────────────────────────
        b.Entity<Profile>(e =>
        {
            e.Property(x => x.Id).ValueGeneratedNever();   // singleton Id=1 (pas d'identity)
            e.Property(x => x.FullName).HasMaxLength(160);
            e.Property(x => x.Title).HasMaxLength(160);
            e.Property(x => x.Bio).HasMaxLength(4000);
            e.HasMany(x => x.SocialLinks)
             .WithOne(x => x.Profile!)
             .HasForeignKey(x => x.ProfileId)
             .OnDelete(DeleteBehavior.Cascade);
        });
        b.Entity<SocialLink>(e =>
        {
            e.Property(x => x.Id).ValueGeneratedNever();
            e.Property(x => x.Label).HasMaxLength(80).IsRequired();
            e.Property(x => x.Url).HasMaxLength(500).IsRequired();
        });

        // ── Service ──────────────────────────────────────────────────────────
        b.Entity<Service>(e =>
        {
            e.Property(x => x.Id).ValueGeneratedNever();
            e.Property(x => x.Title).HasMaxLength(160).IsRequired();
            e.Property(x => x.ShortDescription).HasMaxLength(600);
            e.Property(x => x.Icon).HasMaxLength(60);
            e.Property(x => x.Domain).HasConversion<string>().HasMaxLength(20);
            e.HasIndex(x => x.DisplayOrder);
        });

        // ── TimelineEntry ────────────────────────────────────────────────────
        b.Entity<TimelineEntry>(e =>
        {
            e.Property(x => x.Id).ValueGeneratedNever();
            e.Property(x => x.Type).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.Organization).HasMaxLength(200);
            e.Property(x => x.Location).HasMaxLength(160);
            e.Property(x => x.Period).HasMaxLength(80);
            e.Property(x => x.Description).HasMaxLength(2000);
            e.HasIndex(x => x.DisplayOrder);
        });

        // ── Project + ProjectImage ───────────────────────────────────────────
        b.Entity<Project>(e =>
        {
            e.Property(x => x.Id).ValueGeneratedNever();
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.Description).HasMaxLength(8000);
            e.Property(x => x.Category).HasMaxLength(80);
            e.Property(x => x.Surface).HasMaxLength(60);
            e.Property(x => x.Client).HasMaxLength(160);
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            e.HasIndex(x => x.Status);
            e.HasIndex(x => x.Category);
            e.HasMany(x => x.Images)
             .WithOne(x => x.Project!)
             .HasForeignKey(x => x.ProjectId)
             .OnDelete(DeleteBehavior.Cascade);
        });
        b.Entity<ProjectImage>(e =>
        {
            e.Property(x => x.Id).ValueGeneratedNever();
            e.Property(x => x.Url).HasMaxLength(500).IsRequired();
            e.Property(x => x.FileName).HasMaxLength(160);
            e.Property(x => x.Phase).HasConversion<string>().HasMaxLength(10);
        });

        // ── AppSettings ──────────────────────────────────────────────────────
        b.Entity<AppSettings>(e =>
        {
            e.Property(x => x.Id).ValueGeneratedNever();   // singleton Id=1 (pas d'identity)
            e.Property(x => x.AppName).HasMaxLength(120);
            e.Property(x => x.MainTitle).HasMaxLength(200);
            e.Property(x => x.PublicUrl).HasMaxLength(300);
        });

        // ── VisitLog ─────────────────────────────────────────────────────────
        b.Entity<VisitLog>(e =>
        {
            e.Property(x => x.Page).HasMaxLength(300);
            e.Property(x => x.Referrer).HasMaxLength(500);
            e.Property(x => x.Source).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.TargetType).HasConversion<string>().HasMaxLength(20);
            e.HasIndex(x => x.VisitedAtUtc);                          // agrégats par date
            e.HasIndex(x => new { x.TargetType, x.TargetId });        // « top consultés »
            e.HasIndex(x => x.Source);
        });
    }
}

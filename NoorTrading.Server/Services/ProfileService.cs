using Microsoft.EntityFrameworkCore;
using NoorTrading.Server.Common;
using NoorTrading.Server.Domain.Entities;
using NoorTrading.Server.Dtos;
using NoorTrading.Server.Repositories;

namespace NoorTrading.Server.Services;

public interface IProfileService
{
    Task<ProfileDto> GetAsync();
    Task<ProfileDto> UpdateAsync(UpdateProfileRequest req);
    Task<string> UpdatePhotoAsync(IFormFile file);
}

public class ProfileService(IUnitOfWork uow, IFileStorage storage) : IProfileService
{
    private IRepository<Profile> Repo => uow.Repository<Profile>();

    public async Task<ProfileDto> GetAsync() => Map(await LoadAsync());

    public async Task<ProfileDto> UpdateAsync(UpdateProfileRequest req)
    {
        var profile = await LoadAsync(tracking: true);

        profile.FullName = req.FullName.Trim();
        profile.Title = req.Title.Trim();
        profile.Bio = req.Bio;
        profile.Email = req.Email;
        profile.Phone = req.Phone;
        profile.Location = req.Location;
        profile.UpdatedAtUtc = DateTime.UtcNow;

        // Remplacement complet de la liste de liens
        profile.SocialLinks.Clear();
        if (req.SocialLinks is { Count: > 0 })
        {
            foreach (var l in req.SocialLinks)
                profile.SocialLinks.Add(new SocialLink
                {
                    ProfileId = profile.Id,
                    Label = l.Label.Trim(),
                    Url = l.Url.Trim(),
                    Icon = l.Icon,
                    DisplayOrder = l.DisplayOrder,
                });
        }

        await uow.SaveChangesAsync();
        return Map(profile);
    }

    public async Task<string> UpdatePhotoAsync(IFormFile file)
    {
        var profile = await LoadAsync(tracking: true);
        var (url, _) = await storage.SaveImageAsync(file, "uploads/profil");

        if (!string.IsNullOrEmpty(profile.PhotoUrl))
            storage.Delete(profile.PhotoUrl);

        profile.PhotoUrl = url;
        profile.UpdatedAtUtc = DateTime.UtcNow;
        await uow.SaveChangesAsync();
        return url;
    }

    private async Task<Profile> LoadAsync(bool tracking = false)
    {
        var profile = await Repo.Query(tracking)
            .Include(p => p.SocialLinks)
            .FirstOrDefaultAsync(p => p.Id == 1);

        if (profile is null)
        {
            profile = new Profile { Id = 1 };
            await Repo.AddAsync(profile);
            await uow.SaveChangesAsync();
        }
        return profile;
    }

    private static ProfileDto Map(Profile p) => new(
        p.FullName, p.Title, p.Bio, p.PhotoUrl, p.Email, p.Phone, p.Location, p.UpdatedAtUtc,
        p.SocialLinks
            .OrderBy(s => s.DisplayOrder)
            .Select(s => new SocialLinkDto(s.Id, s.Label, s.Url, s.Icon, s.DisplayOrder))
            .ToList());
}

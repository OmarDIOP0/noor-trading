using Microsoft.EntityFrameworkCore;
using NoorTrading.Server.Common;
using NoorTrading.Server.Domain.Entities;
using NoorTrading.Server.Dtos;
using NoorTrading.Server.Repositories;

namespace NoorTrading.Server.Services;

public interface ISettingsService
{
    Task<AppSettingsDto> GetAsync();
    Task<AppSettingsDto> UpdateAsync(UpdateSettingsRequest req);
    Task<string> UpdateLogoAsync(IFormFile file);
}

public class SettingsService(IUnitOfWork uow, IFileStorage storage) : ISettingsService
{
    private IRepository<AppSettings> Repo => uow.Repository<AppSettings>();

    public async Task<AppSettingsDto> GetAsync() => Map(await LoadAsync());

    public async Task<AppSettingsDto> UpdateAsync(UpdateSettingsRequest req)
    {
        var s = await LoadAsync(tracking: true);
        s.AppName = req.AppName.Trim();
        s.MainTitle = req.MainTitle.Trim();
        s.AdminEmail = req.AdminEmail;
        s.PublicUrl = req.PublicUrl.Trim().TrimEnd('/');
        s.UpdatedAtUtc = DateTime.UtcNow;
        await uow.SaveChangesAsync();
        return Map(s);
    }

    public async Task<string> UpdateLogoAsync(IFormFile file)
    {
        var s = await LoadAsync(tracking: true);
        var (url, _) = await storage.SaveImageAsync(file, "uploads/app");
        if (!string.IsNullOrEmpty(s.LogoUrl)) storage.Delete(s.LogoUrl);
        s.LogoUrl = url;
        s.UpdatedAtUtc = DateTime.UtcNow;
        await uow.SaveChangesAsync();
        return url;
    }

    private async Task<AppSettings> LoadAsync(bool tracking = false)
    {
        var s = await Repo.Query(tracking).FirstOrDefaultAsync(x => x.Id == 1);
        if (s is null)
        {
            s = new AppSettings { Id = 1 };
            await Repo.AddAsync(s);
            await uow.SaveChangesAsync();
        }
        return s;
    }

    private static AppSettingsDto Map(AppSettings s) => new(
        s.AppName, s.LogoUrl, s.MainTitle, s.AdminEmail, s.PublicUrl, s.UpdatedAtUtc);
}

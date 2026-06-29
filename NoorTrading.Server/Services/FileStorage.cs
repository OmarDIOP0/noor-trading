using NoorTrading.Server.Common;

namespace NoorTrading.Server.Services;

public interface IFileStorage
{
    /// <summary>Enregistre une image validée et renvoie son URL relative (ex: /uploads/projets/{id}/{guid}.jpg).</summary>
    Task<(string url, string fileName)> SaveImageAsync(IFormFile file, string subFolder);
    void Delete(string relativeUrl);
}

public class FileStorage(IWebHostEnvironment env, ILogger<FileStorage> logger) : IFileStorage
{
    private const long MaxBytes = 5 * 1024 * 1024; // 5 Mo

    private static readonly Dictionary<string, string> AllowedTypes = new()
    {
        ["image/jpeg"] = ".jpg",
        ["image/png"] = ".png",
        ["image/webp"] = ".webp",
    };

    public async Task<(string url, string fileName)> SaveImageAsync(IFormFile file, string subFolder)
    {
        if (file is null || file.Length == 0)
            throw AppException.BadRequest("Aucun fichier reçu.");
        if (file.Length > MaxBytes)
            throw AppException.BadRequest("Image trop volumineuse (max 5 Mo).");
        if (!AllowedTypes.TryGetValue(file.ContentType.ToLowerInvariant(), out var ext))
            throw AppException.BadRequest("Format non supporté (jpg, png ou webp uniquement).");

        var webRoot = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        var folder = Path.Combine(webRoot, subFolder.Replace('/', Path.DirectorySeparatorChar));
        Directory.CreateDirectory(folder);

        var fileName = $"{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(folder, fileName);

        await using (var stream = new FileStream(fullPath, FileMode.Create))
            await file.CopyToAsync(stream);

        var url = $"/{subFolder.Trim('/')}/{fileName}";
        logger.LogInformation("Image enregistrée : {Url}", url);
        return (url, fileName);
    }

    public void Delete(string relativeUrl)
    {
        if (string.IsNullOrWhiteSpace(relativeUrl)) return;
        var webRoot = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        var path = Path.Combine(webRoot, relativeUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        try
        {
            if (File.Exists(path)) File.Delete(path);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Échec suppression fichier {Path}", path);
        }
    }
}

using Microsoft.EntityFrameworkCore;
using NoorTrading.Server.Common;
using NoorTrading.Server.Domain.Entities;
using NoorTrading.Server.Dtos;
using NoorTrading.Server.Repositories;

namespace NoorTrading.Server.Services;

public interface IProjectService
{
    Task<Paged<ProjectDto>> GetAllAsync(ProjectsFilter filter);
    Task<ProjectDto> GetByIdAsync(Guid id);
    Task<ProjectDto> CreateAsync(CreateProjectRequest req);
    Task<ProjectDto> UpdateAsync(Guid id, UpdateProjectRequest req);
    Task DeleteAsync(Guid id);
    Task<ProjectImageDto> AddImageAsync(Guid id, IFormFile file, ImagePhase phase);
    Task DeleteImageAsync(Guid id, Guid imageId);
    Task SetCoverAsync(Guid id, Guid imageId);
}

public class ProjectService(IUnitOfWork uow, IFileStorage storage) : IProjectService
{
    private IRepository<Project> Repo => uow.Repository<Project>();

    public async Task<Paged<ProjectDto>> GetAllAsync(ProjectsFilter filter)
    {
        var page = Math.Max(1, filter.Page);
        var size = Math.Clamp(filter.PageSize, 1, 100);

        var query = Repo.Query().Include(p => p.Images).AsQueryable();
        if (!string.IsNullOrWhiteSpace(filter.Category))
            query = query.Where(p => p.Category == filter.Category);
        if (filter.Status is not null)
            query = query.Where(p => p.Status == filter.Status);

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(p => p.DisplayOrder).ThenByDescending(p => p.CreatedAtUtc)
            .Skip((page - 1) * size).Take(size)
            .ToListAsync();

        return new Paged<ProjectDto>
        {
            Items = items.Select(Map).ToList(),
            Page = page,
            PageSize = size,
            Total = total,
        };
    }

    public async Task<ProjectDto> GetByIdAsync(Guid id) => Map(await LoadAsync(id));

    public async Task<ProjectDto> CreateAsync(CreateProjectRequest req)
    {
        var project = new Project
        {
            Title = req.Title.Trim(),
            Description = req.Description,
            Category = req.Category.Trim(),
            Year = req.Year,
            Surface = req.Surface,
            Client = req.Client,
            Status = req.Status,
            DisplayOrder = req.DisplayOrder,
        };
        await Repo.AddAsync(project);
        await uow.SaveChangesAsync();
        return Map(project);
    }

    public async Task<ProjectDto> UpdateAsync(Guid id, UpdateProjectRequest req)
    {
        var project = await LoadAsync(id, tracking: true);
        project.Title = req.Title.Trim();
        project.Description = req.Description;
        project.Category = req.Category.Trim();
        project.Year = req.Year;
        project.Surface = req.Surface;
        project.Client = req.Client;
        project.Status = req.Status;
        project.DisplayOrder = req.DisplayOrder;
        project.UpdatedAtUtc = DateTime.UtcNow;

        Repo.Update(project);
        await uow.SaveChangesAsync();
        return Map(project);
    }

    public async Task DeleteAsync(Guid id)
    {
        var project = await LoadAsync(id, tracking: true);
        foreach (var img in project.Images)
            storage.Delete(img.Url);
        Repo.Remove(project);   // cascade supprime les ProjectImage en base
        await uow.SaveChangesAsync();
    }

    public async Task<ProjectImageDto> AddImageAsync(Guid id, IFormFile file, ImagePhase phase)
    {
        var project = await LoadAsync(id, tracking: true);
        var (url, fileName) = await storage.SaveImageAsync(file, $"uploads/projets/{project.Id}");

        var image = new ProjectImage
        {
            ProjectId = project.Id,
            Url = url,
            FileName = fileName,
            Phase = phase,
            SortOrder = project.Images.Count == 0 ? 0 : project.Images.Max(i => i.SortOrder) + 1,
            // La couverture est une photo « après » : 1ère photo Après et aucune couverture définie
            IsCover = phase == ImagePhase.Apres && !project.Images.Any(i => i.IsCover),
        };
        project.Images.Add(image);
        project.UpdatedAtUtc = DateTime.UtcNow;
        await uow.SaveChangesAsync();

        return new ProjectImageDto(image.Id, image.Url, image.SortOrder, image.IsCover, image.Phase);
    }

    public async Task DeleteImageAsync(Guid id, Guid imageId)
    {
        var project = await LoadAsync(id, tracking: true);
        var image = project.Images.FirstOrDefault(i => i.Id == imageId)
            ?? throw AppException.NotFound("Image introuvable.");

        storage.Delete(image.Url);
        var wasCover = image.IsCover;
        project.Images.Remove(image);

        if (wasCover && project.Images.Count > 0)
            project.Images.OrderBy(i => i.SortOrder).First().IsCover = true;

        project.UpdatedAtUtc = DateTime.UtcNow;
        await uow.SaveChangesAsync();
    }

    public async Task SetCoverAsync(Guid id, Guid imageId)
    {
        var project = await LoadAsync(id, tracking: true);
        if (project.Images.All(i => i.Id != imageId))
            throw AppException.NotFound("Image introuvable.");

        foreach (var img in project.Images)
            img.IsCover = img.Id == imageId;

        project.UpdatedAtUtc = DateTime.UtcNow;
        await uow.SaveChangesAsync();
    }

    private async Task<Project> LoadAsync(Guid id, bool tracking = false) =>
        await Repo.Query(tracking).Include(p => p.Images).FirstOrDefaultAsync(p => p.Id == id)
            ?? throw AppException.NotFound("Réalisation introuvable.");

    private static ProjectDto Map(Project p)
    {
        var images = p.Images
            .OrderBy(i => i.SortOrder)
            .Select(i => new ProjectImageDto(i.Id, i.Url, i.SortOrder, i.IsCover, i.Phase))
            .ToList();
        // Couverture = photo « après » de préférence
        var cover = p.Images.FirstOrDefault(i => i.IsCover)?.Url
                    ?? p.Images.Where(i => i.Phase == ImagePhase.Apres).OrderBy(i => i.SortOrder).FirstOrDefault()?.Url
                    ?? images.FirstOrDefault()?.Url;
        return new ProjectDto(
            p.Id, p.Title, p.Description, p.Category, p.Year, p.Surface, p.Client,
            p.Status, p.DisplayOrder, cover, p.UpdatedAtUtc, images);
    }
}

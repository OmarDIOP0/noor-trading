using NoorTrading.Server.Common;
using NoorTrading.Server.Domain.Entities;
using NoorTrading.Server.Dtos;
using NoorTrading.Server.Repositories;

namespace NoorTrading.Server.Services;

public interface IServiceCatalogService
{
    Task<IReadOnlyList<ServiceDto>> GetAllAsync();
    Task<ServiceDto> CreateAsync(CreateServiceRequest req);
    Task<ServiceDto> UpdateAsync(Guid id, UpdateServiceRequest req);
    Task DeleteAsync(Guid id);
}

public class ServiceCatalogService(IUnitOfWork uow) : IServiceCatalogService
{
    private IRepository<Service> Repo => uow.Repository<Service>();

    public async Task<IReadOnlyList<ServiceDto>> GetAllAsync()
    {
        var items = await Repo.ListAsync();
        return items
            .OrderBy(s => s.DisplayOrder).ThenBy(s => s.Title)
            .Select(Map).ToList();
    }

    public async Task<ServiceDto> CreateAsync(CreateServiceRequest req)
    {
        var service = new Service
        {
            Title = req.Title.Trim(),
            ShortDescription = req.ShortDescription.Trim(),
            Icon = req.Icon,
            Domain = req.Domain,
            DisplayOrder = req.DisplayOrder,
            IsActive = req.IsActive,
        };
        await Repo.AddAsync(service);
        await uow.SaveChangesAsync();
        return Map(service);
    }

    public async Task<ServiceDto> UpdateAsync(Guid id, UpdateServiceRequest req)
    {
        var service = await Repo.FindAsync(id)
            ?? throw AppException.NotFound("Service introuvable.");

        service.Title = req.Title.Trim();
        service.ShortDescription = req.ShortDescription.Trim();
        service.Icon = req.Icon;
        service.Domain = req.Domain;
        service.DisplayOrder = req.DisplayOrder;
        service.IsActive = req.IsActive;
        service.UpdatedAtUtc = DateTime.UtcNow;

        Repo.Update(service);
        await uow.SaveChangesAsync();
        return Map(service);
    }

    public async Task DeleteAsync(Guid id)
    {
        var service = await Repo.FindAsync(id)
            ?? throw AppException.NotFound("Service introuvable.");
        Repo.Remove(service);
        await uow.SaveChangesAsync();
    }

    private static ServiceDto Map(Service s) => new(
        s.Id, s.Title, s.ShortDescription, s.Icon, s.Domain, s.DisplayOrder, s.IsActive, s.UpdatedAtUtc);
}

using NoorTrading.Server.Common;
using NoorTrading.Server.Domain.Entities;
using NoorTrading.Server.Dtos;
using NoorTrading.Server.Repositories;

namespace NoorTrading.Server.Services;

public interface ITimelineService
{
    Task<IReadOnlyList<TimelineEntryDto>> GetAllAsync();
    Task<TimelineEntryDto> CreateAsync(TimelineEntryInput req);
    Task<TimelineEntryDto> UpdateAsync(Guid id, TimelineEntryInput req);
    Task DeleteAsync(Guid id);
}

public class TimelineService(IUnitOfWork uow) : ITimelineService
{
    private IRepository<TimelineEntry> Repo => uow.Repository<TimelineEntry>();

    public async Task<IReadOnlyList<TimelineEntryDto>> GetAllAsync()
    {
        var items = await Repo.ListAsync();
        return items
            .OrderBy(t => t.DisplayOrder)
            .ThenByDescending(t => t.StartYear ?? 0)
            .Select(Map).ToList();
    }

    public async Task<TimelineEntryDto> CreateAsync(TimelineEntryInput req)
    {
        var entry = new TimelineEntry();
        Apply(entry, req);
        await Repo.AddAsync(entry);
        await uow.SaveChangesAsync();
        return Map(entry);
    }

    public async Task<TimelineEntryDto> UpdateAsync(Guid id, TimelineEntryInput req)
    {
        var entry = await Repo.FindAsync(id)
            ?? throw AppException.NotFound("Étape introuvable.");
        Apply(entry, req);
        entry.UpdatedAtUtc = DateTime.UtcNow;
        Repo.Update(entry);
        await uow.SaveChangesAsync();
        return Map(entry);
    }

    public async Task DeleteAsync(Guid id)
    {
        var entry = await Repo.FindAsync(id)
            ?? throw AppException.NotFound("Étape introuvable.");
        Repo.Remove(entry);
        await uow.SaveChangesAsync();
    }

    private static void Apply(TimelineEntry e, TimelineEntryInput req)
    {
        e.Type = req.Type;
        e.Title = req.Title.Trim();
        e.Organization = req.Organization;
        e.Location = req.Location;
        e.Period = req.Period.Trim();
        e.StartYear = req.StartYear;
        e.IsCurrent = req.IsCurrent;
        e.Description = req.Description;
        e.DisplayOrder = req.DisplayOrder;
    }

    private static TimelineEntryDto Map(TimelineEntry t) => new(
        t.Id, t.Type, t.Title, t.Organization, t.Location, t.Period,
        t.StartYear, t.IsCurrent, t.Description, t.DisplayOrder);
}

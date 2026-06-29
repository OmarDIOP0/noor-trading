using System.Collections.Concurrent;
using NoorTrading.Server.Data;

namespace NoorTrading.Server.Repositories;

public interface IUnitOfWork
{
    IRepository<T> Repository<T>() where T : class;
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

public class UnitOfWork(NoorTradingDbContext db) : IUnitOfWork
{
    private readonly ConcurrentDictionary<Type, object> _repos = new();

    public IRepository<T> Repository<T>() where T : class =>
        (IRepository<T>)_repos.GetOrAdd(typeof(T), _ => new Repository<T>(db));

    public Task<int> SaveChangesAsync(CancellationToken ct = default) =>
        db.SaveChangesAsync(ct);
}

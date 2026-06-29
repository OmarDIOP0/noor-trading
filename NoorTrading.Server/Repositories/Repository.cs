using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using NoorTrading.Server.Data;

namespace NoorTrading.Server.Repositories;

public class Repository<T>(NoorTradingDbContext db) : IRepository<T> where T : class
{
    protected readonly NoorTradingDbContext Db = db;
    protected DbSet<T> Set => Db.Set<T>();

    public IQueryable<T> Query(bool tracking = false) =>
        tracking ? Set : Set.AsNoTracking();

    public async Task<T?> FindAsync(params object[] keyValues) =>
        await Set.FindAsync(keyValues);

    public Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, bool tracking = true) =>
        Query(tracking).FirstOrDefaultAsync(predicate);

    public Task<List<T>> ListAsync(Expression<Func<T, bool>>? predicate = null) =>
        (predicate is null ? Query() : Query().Where(predicate)).ToListAsync();

    public Task<bool> AnyAsync(Expression<Func<T, bool>> predicate) =>
        Set.AnyAsync(predicate);

    public async Task AddAsync(T entity) => await Set.AddAsync(entity);
    public void Update(T entity) => Set.Update(entity);
    public void Remove(T entity) => Set.Remove(entity);
}

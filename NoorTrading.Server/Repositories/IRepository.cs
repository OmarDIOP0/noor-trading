using System.Linq.Expressions;

namespace NoorTrading.Server.Repositories;

/// <summary>Dépôt générique en lecture/écriture sur une entité.</summary>
public interface IRepository<T> where T : class
{
    /// <summary>Requête composable. <paramref name="tracking"/>=false pour la lecture seule.</summary>
    IQueryable<T> Query(bool tracking = false);

    Task<T?> FindAsync(params object[] keyValues);
    Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, bool tracking = true);
    Task<List<T>> ListAsync(Expression<Func<T, bool>>? predicate = null);
    Task<bool> AnyAsync(Expression<Func<T, bool>> predicate);

    Task AddAsync(T entity);
    void Update(T entity);
    void Remove(T entity);
}

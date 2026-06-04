using CyberHub.DAL.Context;
using CyberHub.DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CyberHub.DAL.Repositories.Implementations;

/// <summary>
/// Базова реалізація Generic Repository з AppDbContext.
/// </summary>
public abstract class BaseRepository<T>(AppDbContext db) : IRepository<T> where T : class
{
    protected readonly AppDbContext Db = db;
    protected readonly DbSet<T> Set = db.Set<T>();

    public virtual async Task<IEnumerable<T>> GetAllAsync() =>
        await Set.AsNoTracking().ToListAsync();

    public virtual async Task<T?> GetByIdAsync(Guid id) =>
        await Set.FindAsync(id);

    public virtual async Task<T> CreateAsync(T entity)
    {
        Set.Add(entity);
        await Db.SaveChangesAsync();
        return entity;
    }

    public virtual async Task UpdateAsync(T entity)
    {
        Db.Entry(entity).State = EntityState.Modified;
        await Db.SaveChangesAsync();
    }

    public virtual async Task DeleteAsync(Guid id)
    {
        var entity = await GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"{typeof(T).Name} {id} not found");
        Set.Remove(entity);
        await Db.SaveChangesAsync();
    }

    public virtual async Task<bool> ExistsAsync(Guid id) =>
        await Set.FindAsync(id) is not null;
}

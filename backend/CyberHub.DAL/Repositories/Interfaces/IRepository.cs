namespace CyberHub.DAL.Repositories.Interfaces;

/// <summary>
/// Загальний інтерфейс репозиторію (Generic Repository Pattern).
/// </summary>
public interface IRepository<T> where T : class
{
    Task<IEnumerable<T>> GetAllAsync();
    Task<T?> GetByIdAsync(Guid id);
    Task<T> CreateAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
}

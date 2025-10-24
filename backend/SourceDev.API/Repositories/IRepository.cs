using System.Linq.Expressions;

namespace SourceDev.API.Repositories
{
    public interface IRepository<T> where T : class
    {
        // Read operations
        Task<T?> GetByIdAsync(int id);
        Task<IEnumerable<T>> GetAllAsync();
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
        Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate);
        
        // Create
        Task<T> AddAsync(T entity);
        Task AddRangeAsync(IEnumerable<T> entities);
        
        // Update
        void Update(T entity);
        void UpdateRange(IEnumerable<T> entities);
        
        // Delete
        void Delete(T entity);
        void DeleteRange(IEnumerable<T> entities);
        
        // Count & Exists
        Task<int> CountAsync();
        Task<int> CountAsync(Expression<Func<T, bool>> predicate);
        Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate);
    }
}

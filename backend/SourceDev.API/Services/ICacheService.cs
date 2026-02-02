namespace SourceDev.API.Services
{
    public interface ICacheService
    {
        /// <summary>
        /// Gets a cached item or creates it if not found
        /// </summary>
        Task<T?> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null);
        
        /// <summary>
        /// Gets a cached item
        /// </summary>
        Task<T?> GetAsync<T>(string key);
        
        /// <summary>
        /// Sets a cached item
        /// </summary>
        Task SetAsync<T>(string key, T value, TimeSpan? expiration = null);
        
        /// <summary>
        /// Removes a cached item
        /// </summary>
        Task RemoveAsync(string key);
        
        /// <summary>
        /// Removes all cached items matching a pattern
        /// </summary>
        Task RemoveByPrefixAsync(string prefix);
    }
}

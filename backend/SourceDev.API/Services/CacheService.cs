using Microsoft.Extensions.Caching.Memory;
using System.Collections.Concurrent;

namespace SourceDev.API.Services
{
    public class CacheService : ICacheService
    {
        private readonly IMemoryCache _cache;
        private readonly ILogger<CacheService> _logger;
        private static readonly ConcurrentDictionary<string, byte> _keys = new();
        
        // Default cache durations
        private static readonly TimeSpan DefaultExpiration = TimeSpan.FromMinutes(5);
        
        public CacheService(IMemoryCache cache, ILogger<CacheService> logger)
        {
            _cache = cache;
            _logger = logger;
        }

        public async Task<T?> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null)
        {
            if (_cache.TryGetValue(key, out T? cachedValue))
            {
                _logger.LogDebug("Cache hit for key: {Key}", key);
                return cachedValue;
            }

            _logger.LogDebug("Cache miss for key: {Key}", key);
            var value = await factory();
            
            if (value != null)
            {
                await SetAsync(key, value, expiration);
            }
            
            return value;
        }

        public Task<T?> GetAsync<T>(string key)
        {
            _cache.TryGetValue(key, out T? value);
            return Task.FromResult(value);
        }

        public Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
        {
            var options = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(expiration ?? DefaultExpiration)
                .SetSlidingExpiration(TimeSpan.FromMinutes(2))
                .RegisterPostEvictionCallback((evictedKey, _, _, _) =>
                {
                    _keys.TryRemove(evictedKey.ToString()!, out _);
                });

            _cache.Set(key, value, options);
            _keys.TryAdd(key, 0);
            
            _logger.LogDebug("Cached key: {Key} with expiration: {Expiration}", key, expiration ?? DefaultExpiration);
            return Task.CompletedTask;
        }

        public Task RemoveAsync(string key)
        {
            _cache.Remove(key);
            _keys.TryRemove(key, out _);
            _logger.LogDebug("Removed cache key: {Key}", key);
            return Task.CompletedTask;
        }

        public Task RemoveByPrefixAsync(string prefix)
        {
            var keysToRemove = _keys.Keys.Where(k => k.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)).ToList();
            
            foreach (var key in keysToRemove)
            {
                _cache.Remove(key);
                _keys.TryRemove(key, out _);
            }
            
            _logger.LogDebug("Removed {Count} cache keys with prefix: {Prefix}", keysToRemove.Count, prefix);
            return Task.CompletedTask;
        }
    }

    // Cache key constants for consistency
    public static class CacheKeys
    {
        public const string LatestPosts = "posts:latest";
        public const string TopPosts = "posts:top";
        public const string PopularTags = "tags:popular";
        public const string AllTags = "tags:all";
        
        public static string PostById(int id) => $"posts:{id}";
        public static string PostBySlug(string slug) => $"posts:slug:{slug}";
        public static string UserById(int id) => $"users:{id}";
        public static string UserByUsername(string username) => $"users:username:{username}";
        public static string TagBySlug(string slug) => $"tags:slug:{slug}";
        public static string PostsByTag(string tag, int page) => $"posts:tag:{tag}:page:{page}";
        public static string PostsByUser(int userId, int page) => $"posts:user:{userId}:page:{page}";
    }
}

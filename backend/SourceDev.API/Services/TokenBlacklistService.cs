using System.Collections.Concurrent;

namespace SourceDev.API.Services
{
    public class TokenBlacklistService : ITokenBlacklistService
    {
        // In-memory blacklist
        private static readonly ConcurrentDictionary<string, DateTime> _blacklistedTokens = new();

        public Task AddToBlacklistAsync(string token)
        {
            _blacklistedTokens.TryAdd(token, DateTime.UtcNow.AddDays(1));
            return Task.CompletedTask;
        }

        public Task<bool> IsBlacklistedAsync(string token)
        {
            return Task.FromResult(_blacklistedTokens.ContainsKey(token));
        }

        public Task RemoveExpiredTokensAsync()
        {
            var now = DateTime.UtcNow;
            var expiredTokens = _blacklistedTokens
                .Where(kvp => kvp.Value < now)
                .Select(kvp => kvp.Key)
                .ToList();

            foreach (var token in expiredTokens)
            {
                _blacklistedTokens.TryRemove(token, out _);
            }

            return Task.CompletedTask;
        }
    }
}

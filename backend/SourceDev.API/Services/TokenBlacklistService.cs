using System.Collections.Concurrent;

namespace SourceDev.API.Services
{
    public class TokenBlacklistService : ITokenBlacklistService
    {
        // In-memory blacklist
        private static readonly ConcurrentDictionary<string, DateTime> _blacklistedTokens = new();

        public Task AddToBlacklistAsync(string token)
        {
            // #region agent log
            try { var logData = System.Text.Json.JsonSerializer.Serialize(new { sessionId = "debug-session", runId = "run1", hypothesisId = "C", location = "TokenBlacklistService.cs:10", message = "AddToBlacklistAsync entry", data = new { tokenLength = token?.Length ?? 0, currentBlacklistCount = _blacklistedTokens.Count }, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() }); System.IO.File.AppendAllText("/home/emin/Documents/projects/SourceDev/.cursor/debug.log", logData + "\n"); } catch { }
            // #endregion
            _blacklistedTokens.TryAdd(token, DateTime.UtcNow.AddDays(1));
            // #region agent log
            try { var logData = System.Text.Json.JsonSerializer.Serialize(new { sessionId = "debug-session", runId = "run1", hypothesisId = "C", location = "TokenBlacklistService.cs:14", message = "AddToBlacklistAsync exit", data = new { newBlacklistCount = _blacklistedTokens.Count }, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() }); System.IO.File.AppendAllText("/home/emin/Documents/projects/SourceDev/.cursor/debug.log", logData + "\n"); } catch { }
            // #endregion
            return Task.CompletedTask;
        }

        public Task<bool> IsBlacklistedAsync(string token)
        {
            return Task.FromResult(_blacklistedTokens.ContainsKey(token));
        }

        public Task RemoveExpiredTokensAsync()
        {
            // #region agent log
            try { var logData = System.Text.Json.JsonSerializer.Serialize(new { sessionId = "debug-session", runId = "run1", hypothesisId = "C", location = "TokenBlacklistService.cs:21", message = "RemoveExpiredTokensAsync called", data = new { blacklistCountBefore = _blacklistedTokens.Count }, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() }); System.IO.File.AppendAllText("/home/emin/Documents/projects/SourceDev/.cursor/debug.log", logData + "\n"); } catch { }
            // #endregion
            var now = DateTime.UtcNow;
            var expiredTokens = _blacklistedTokens
                .Where(kvp => kvp.Value < now)
                .Select(kvp => kvp.Key)
                .ToList();
            // #region agent log
            try { var logData = System.Text.Json.JsonSerializer.Serialize(new { sessionId = "debug-session", runId = "run1", hypothesisId = "C", location = "TokenBlacklistService.cs:28", message = "Expired tokens found", data = new { expiredCount = expiredTokens.Count }, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() }); System.IO.File.AppendAllText("/home/emin/Documents/projects/SourceDev/.cursor/debug.log", logData + "\n"); } catch { }
            // #endregion

            foreach (var token in expiredTokens)
            {
                _blacklistedTokens.TryRemove(token, out _);
            }
            // #region agent log
            try { var logData = System.Text.Json.JsonSerializer.Serialize(new { sessionId = "debug-session", runId = "run1", hypothesisId = "C", location = "TokenBlacklistService.cs:35", message = "RemoveExpiredTokensAsync exit", data = new { blacklistCountAfter = _blacklistedTokens.Count }, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() }); System.IO.File.AppendAllText("/home/emin/Documents/projects/SourceDev/.cursor/debug.log", logData + "\n"); } catch { }
            // #endregion

            return Task.CompletedTask;
        }
    }
}

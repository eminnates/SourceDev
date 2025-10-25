namespace SourceDev.API.Services
{
    public interface ITokenBlacklistService
    {
        Task AddToBlacklistAsync(string token);
        Task<bool> IsBlacklistedAsync(string token);
        Task RemoveExpiredTokensAsync();
    }
}

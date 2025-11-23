namespace SourceDev.API.Services
{
    public interface IReactionService
    {
        Task<bool> ToggleReactionAsync(int postId, int userId, string reactionType); // add or remove same type
        Task<bool> RemoveReactionAsync(int postId, int userId, string reactionType);
        Task<Dictionary<string,int>> GetSummaryAsync(int postId);
    }
}

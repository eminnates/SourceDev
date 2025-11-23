using Microsoft.EntityFrameworkCore;
using SourceDev.API.Models.Entities;
using SourceDev.API.Repositories;

namespace SourceDev.API.Services
{
    public class ReactionService : IReactionService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<ReactionService> _logger;

        public ReactionService(IUnitOfWork unitOfWork, ILogger<ReactionService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<bool> ToggleReactionAsync(int postId, int userId, string reactionType)
        {
            reactionType = reactionType.Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(reactionType))
                throw new ArgumentException("Reaction type required", nameof(reactionType));

            var post = await _unitOfWork.Posts.GetByIdAsync(postId);
            if (post == null) return false;

            var existing = await _unitOfWork.Reactions
                .FirstOrDefaultAsync(r => r.post_id == postId && r.user_id == userId && r.reaction_type == reactionType);

            if (existing != null)
            {
                // Remove existing reaction (toggle off)
                _unitOfWork.Reactions.Delete(existing);
                await _unitOfWork.SaveChangesAsync();
                _logger.LogInformation("Reaction removed. PostId: {PostId}, UserId: {UserId}, Type: {Type}", postId, userId, reactionType);
                return true;
            }

            var entity = new Reaction
            {
                post_id = postId,
                user_id = userId,
                reaction_type = reactionType,
                created_at = DateTime.UtcNow
            };
            await _unitOfWork.Reactions.AddAsync(entity);
            await _unitOfWork.SaveChangesAsync();
            _logger.LogInformation("Reaction added. PostId: {PostId}, UserId: {UserId}, Type: {Type}", postId, userId, reactionType);
            return true;
        }

        public async Task<bool> RemoveReactionAsync(int postId, int userId, string reactionType)
        {
            reactionType = reactionType.Trim().ToLowerInvariant();
            var existing = await _unitOfWork.Reactions
                .FirstOrDefaultAsync(r => r.post_id == postId && r.user_id == userId && r.reaction_type == reactionType);
            if (existing == null) return false;
            _unitOfWork.Reactions.Delete(existing);
            await _unitOfWork.SaveChangesAsync();
            _logger.LogInformation("Reaction explicitly removed. PostId: {PostId}, UserId: {UserId}, Type: {Type}", postId, userId, reactionType);
            return true;
        }

        public async Task<Dictionary<string,int>> GetSummaryAsync(int postId)
        {
            var post = await _unitOfWork.Posts.GetByIdAsync(postId);
            if (post == null) return new Dictionary<string,int>();

            var summary = await _unitOfWork.Reactions.Query()
                .Where(r => r.post_id == postId)
                .GroupBy(r => r.reaction_type)
                .Select(g => new { Type = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Type, x => x.Count);

            return summary;
        }
    }
}

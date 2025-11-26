using Microsoft.EntityFrameworkCore;
using SourceDev.API.DTOs.Comment;
using SourceDev.API.Models.Entities;
using SourceDev.API.Repositories;

namespace SourceDev.API.Services
{
    public class CommentService : ICommentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<CommentService> _logger;

        public CommentService(IUnitOfWork unitOfWork, ILogger<CommentService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }
         
        public async Task<CommentDto> AddAsync(int postId, int userId, string content, int? parentCommentId = null)
        {
            if (string.IsNullOrWhiteSpace(content))
                throw new ArgumentException("Comment content cannot be empty.", nameof(content));

            var post = await _unitOfWork.Posts.GetByIdAsync(postId);
            if (post == null)
                throw new InvalidOperationException("Post not found.");

            if (parentCommentId.HasValue)
            {
                var parent = await _unitOfWork.Comments.GetByIdAsync(parentCommentId.Value);
                if (parent == null || parent.post_id != postId)
                    throw new InvalidOperationException("Parent comment not found or mismatched post.");
            }

            var entity = new Comment
            {
                post_id = postId,
                user_id = userId,
                content = content.Trim(),
                parent_comment_id = parentCommentId,
                created_at = DateTime.UtcNow
            };

            await _unitOfWork.Comments.AddAsync(entity);
            await _unitOfWork.SaveChangesAsync();

            // Reload with User information
            var commentWithUser = await _unitOfWork.Comments.Query()
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.comment_id == entity.comment_id);

            _logger.LogInformation("Comment added. CommentId: {CommentId}, PostId: {PostId}, UserId: {UserId}", entity.comment_id, postId, userId);

            return new CommentDto
            {
                Id = entity.comment_id,
                PostId = entity.post_id,
                UserId = entity.user_id,
                Content = entity.content,
                CreatedAt = entity.created_at,
                ParentCommentId = entity.parent_comment_id,
                UserDisplayName = commentWithUser?.User?.display_name ?? string.Empty,
                RepliesCount = 0
            };
        }

        public async Task<bool> DeleteAsync(int commentId, int userId)
        {
            var comment = await _unitOfWork.Comments.GetByIdAsync(commentId);
            if (comment == null) return false;
            if (comment.user_id != userId)
                throw new UnauthorizedAccessException("You can only delete your own comments.");

            _unitOfWork.Comments.Delete(comment);
            await _unitOfWork.SaveChangesAsync();
            _logger.LogInformation("Comment deleted. CommentId: {CommentId}, UserId: {UserId}", commentId, userId);
            return true;
        }

        public async Task<IEnumerable<CommentDto>> GetByPostAsync(int postId, int page = 1, int pageSize = 50)
        {
            if (page < 1 || pageSize < 1) return Enumerable.Empty<CommentDto>();

            var query = _unitOfWork.Comments.Query()
                .Include(c => c.User)
                .Where(c => c.post_id == postId)
                .OrderByDescending(c => c.created_at)
                .Skip((page - 1) * pageSize)
                .Take(pageSize);

            var comments = await query.ToListAsync();

            var commentIds = comments.Select(c => c.comment_id).ToList();
            var repliesCounts = await _unitOfWork.Comments.Query()
                .Where(r => r.parent_comment_id.HasValue && commentIds.Contains(r.parent_comment_id.Value))
                .GroupBy(r => r.parent_comment_id)
                .Select(g => new { ParentId = g.Key!.Value, Count = g.Count() })
                .ToListAsync();

            var repliesCountDict = repliesCounts.ToDictionary(r => r.ParentId, r => r.Count);

            var list = comments.Select(c => new CommentDto
            {
                Id = c.comment_id,
                PostId = c.post_id,
                UserId = c.user_id,
                Content = c.content,
                CreatedAt = c.created_at,
                ParentCommentId = c.parent_comment_id,
                UserDisplayName = c.User?.display_name ?? string.Empty,
                RepliesCount = repliesCountDict.GetValueOrDefault(c.comment_id, 0)
            }).ToList();

            return list;
        }

        public async Task<int> GetCountForPostAsync(int postId)
        {
            return await _unitOfWork.Comments.Query().CountAsync(c => c.post_id == postId);
        }

        public async Task<IEnumerable<CommentDto>> SearchCommentsAsync(string query, int page = 1, int pageSize = 50)
        {
            if (string.IsNullOrWhiteSpace(query) || page < 1 || pageSize < 1)
            {
                return Enumerable.Empty<CommentDto>();
            }

            var normalizedQuery = query.Trim();

            var commentsQuery = _unitOfWork.Comments
                .Query()
                .Include(c => c.User)
                .Where(c => c.content.Contains(normalizedQuery))
                .OrderByDescending(c => c.created_at);

            var comments = await commentsQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (!comments.Any())
            {
                return Enumerable.Empty<CommentDto>();
            }

            var commentDtos = comments.Select(c => new CommentDto
            {
                Id = c.comment_id,
                PostId = c.post_id,
                UserId = c.user_id,
                Content = c.content,
                CreatedAt = c.created_at,
                ParentCommentId = c.parent_comment_id,
                UserDisplayName = c.User != null ? c.User.display_name : string.Empty,
                RepliesCount = 0
            });

            return commentDtos;
        }
    }
}

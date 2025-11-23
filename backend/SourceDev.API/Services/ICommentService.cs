using SourceDev.API.DTOs.Comment;

namespace SourceDev.API.Services
{
    public interface ICommentService
    {
        Task<CommentDto> AddAsync(int postId, int userId, string content, int? parentCommentId = null);
        Task<bool> DeleteAsync(int commentId, int userId);
        Task<IEnumerable<CommentDto>> GetByPostAsync(int postId, int page = 1, int pageSize = 50);
        Task<int> GetCountForPostAsync(int postId);
    }
}

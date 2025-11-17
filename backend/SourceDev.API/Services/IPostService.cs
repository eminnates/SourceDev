using SourceDev.API.DTOs.Post;

namespace SourceDev.API.Services
{
    public interface IPostService
    {
        Task<PostDto?> GetByIdAsync(int id,int? currentUserId = null);
        Task<PostDto?> GetBySlugAsync(string slug,int? currentUserId = null);
        Task<IEnumerable<PostListDto>> GetLatestAsync(int page,int pageSize);
        Task<IEnumerable<PostListDto>> GetTopAsync(int take);
        Task<IEnumerable<PostListDto>> GetRelevantAsync(int? userId, int page, int pageSize);
        Task<IEnumerable<PostListDto>> GetByUserAsync(int userId, int page, int pageSize);
        Task<IEnumerable<PostListDto>> GetByTagAsync(string tagSlug, int page, int pageSize);
        Task<PostDto> CreateAsync(CreatePostDto dto, int authorId);
        Task<bool> UpdateAsync(int id, UpdatePostDto dto, int requesterId);
        Task<bool> DeleteAsync(int id, int requesterId);
        Task<bool> PublishAsync(int id, int requesterId);
        Task<bool> UnpublishAsync(int id, int requesterId);

    }
}

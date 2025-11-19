using SourceDev.API.DTOs.Post;
using SourceDev.API.Models.Entities;

namespace SourceDev.API.Repositories
{
    public interface IPostRepository : IRepository<Post>
    {
        Task<IEnumerable<Post>> GetLatestAsync(int take = 10);
        Task<IEnumerable<Post>> GetTopAsync(int take = 10);
        Task<IEnumerable<Post>> GetRelevantAsync(int? userId, int page = 1, int pageSize = 20);
        Task<Post?> GetByIdWithDetailsAsync(int id);
        Task<Post?> GetBySlugAsync(string slug);
        Task<IEnumerable<Post>> GetByUserAsync(int userId, int page = 1, int pageSize = 20);
        Task<IEnumerable<Post>> GetByTagSlugAsync(string tagSlug, int page = 1, int pageSize = 20);

        // repository-side projection
        Task<IEnumerable<SourceDev.API.DTOs.Post.PostListDto>> GetLatestDtosAsync(int page = 1, int pageSize = 20);
        Task<IEnumerable<SourceDev.API.DTOs.Post.PostListDto>> GetTopDtosAsync(int take = 10);
        Task<SourceDev.API.DTOs.Post.PostDto?> GetDtoByIdAsync(int id);
        Task<SourceDev.API.DTOs.Post.PostDto?> GetDtoBySlugAsync(string slug);
        Task<IEnumerable<SourceDev.API.DTOs.Post.PostListDto>> GetByUserDtosAsync(int userId, int page = 1, int pageSize = 20);
        Task<IEnumerable<SourceDev.API.DTOs.Post.PostListDto>> GetByTagDtosAsync(string tagSlug, int page = 1, int pageSize = 20);
        Task<IEnumerable<SourceDev.API.DTOs.Post.PostListDto>> GetRelevantDtosAsync(int? userId, int page = 1, int pageSize = 20);
        Task<IEnumerable<PostListDto>> SearchInDbAsync(string query, int? userId, int page = 1, int pageSize = 20);

    }
}   

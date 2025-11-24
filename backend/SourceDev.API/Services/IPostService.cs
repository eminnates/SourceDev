using Microsoft.AspNetCore.Mvc;
using SourceDev.API.DTOs.Post;
using SourceDev.API.Models;

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
        Task<IEnumerable<PostListDto>> GetUserDraftsAsync(int userId, int page, int pageSize);
        Task<IEnumerable<PostListDto>> GetByTagAsync(string tagSlug, int page, int pageSize);
        Task<PostDto> CreateAsync(CreatePostDto dto, int authorId);
        Task<bool> UpdateAsync(int id, UpdatePostDto dto, int requesterId);
        Task<bool> DeleteAsync(int id, int requesterId);
        Task<bool> PublishAsync(int id, int requesterId);
        Task<bool> UnpublishAsync(int id, int requesterId);
        Task<bool> ToggleLikeAsync(int postId, int userId);
        Task<bool> ToggleBookmarkAsync(int postId, int userId);
        Task<bool> AddTagToPostAsync(int postId, string tagName, int userId);
        Task<bool> RemoveTagFromPostAsync(int postId, int tagId, int userId);
        Task<IEnumerable<PostListDto>> SearchAsync(string query, int? userId, int page = 1, int pageSize = 20);
        Task<IEnumerable<PostListDto>> GetBookmarkedPostsAsync(int userId, int page, int pageSize);
    }
}

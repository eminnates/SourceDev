using SourceDev.API.DTOs.Admin;
using SourceDev.API.Models.Entities;

namespace SourceDev.API.Repositories
{
    public interface IAdminRepository
    {
        // Post Management
        Task<IEnumerable<AdminPostListDto>> GetAllPostsAsync(int page, int pageSize, bool? status = null);
        Task<int> GetTotalPostsCountAsync(bool? status = null);
        Task<Post?> GetPostByIdForAdminAsync(int postId);
        Task<bool> UpdatePostStatusAsync(int postId, bool status);
        Task<bool> DeletePostPermanentlyAsync(int postId);

        // User Management
        Task<IEnumerable<AdminUserListDto>> GetAllUsersAsync(int page, int pageSize);
        Task<int> GetTotalUsersCountAsync();
        Task<User?> GetUserByIdAsync(int userId);
        Task<bool> ToggleUserDeleteStatusAsync(int userId);

        // Stats
        Task<AdminStatsDto> GetDashboardStatsAsync();
    }
}
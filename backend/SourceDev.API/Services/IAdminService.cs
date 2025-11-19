using SourceDev.API.DTOs.Admin;

namespace SourceDev.API.Services
{
    public interface IAdminService
    {
        // Post Management
        Task<IEnumerable<AdminPostListDto>> GetAllPostsAsync(int page, int pageSize, bool? status = null);
        Task<int> GetTotalPostsCountAsync(bool? status = null);
        Task<bool> ApprovePostAsync(int postId);
        Task<bool> RejectPostAsync(int postId);
        Task<bool> DeletePostPermanentlyAsync(int postId);

        // User Management
        Task<IEnumerable<AdminUserListDto>> GetAllUsersAsync(int page, int pageSize);
        Task<int> GetTotalUsersCountAsync();
        Task<bool> BanUserAsync(int userId);
        Task<bool> UnbanUserAsync(int userId);
        Task<bool> AssignRoleAsync(int userId, string roleName);
        Task<bool> RemoveRoleAsync(int userId, string roleName);

        // Stats
        Task<AdminStatsDto> GetDashboardStatsAsync();
    }
}
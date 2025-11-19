using Microsoft.AspNetCore.Identity;
using SourceDev.API.DTOs.Admin;
using SourceDev.API.Models.Entities;
using SourceDev.API.Repositories;

namespace SourceDev.API.Services
{
    public class AdminService : IAdminService
    {
        private readonly IAdminRepository _adminRepository;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole<int>> _roleManager;
        private readonly ILogger<AdminService> _logger;

        public AdminService(
            IAdminRepository adminRepository,
            UserManager<User> userManager,
            RoleManager<IdentityRole<int>> roleManager,
            ILogger<AdminService> logger)
        {
            _adminRepository = adminRepository;
            _userManager = userManager;
            _roleManager = roleManager;
            _logger = logger;
        }

        // POST MANAGEMENT
        public async Task<IEnumerable<AdminPostListDto>> GetAllPostsAsync(int page, int pageSize, bool? status = null)
        {
            return await _adminRepository.GetAllPostsAsync(page, pageSize, status);
        }

        public async Task<int> GetTotalPostsCountAsync(bool? status = null)
        {
            return await _adminRepository.GetTotalPostsCountAsync(status);
        }

        public async Task<bool> ApprovePostAsync(int postId)
        {
            _logger.LogInformation("Approving post {PostId}", postId);
            return await _adminRepository.UpdatePostStatusAsync(postId, true);
        }

        public async Task<bool> RejectPostAsync(int postId)
        {
            _logger.LogInformation("Rejecting post {PostId}", postId);
            return await _adminRepository.UpdatePostStatusAsync(postId, false);
        }

        public async Task<bool> DeletePostPermanentlyAsync(int postId)
        {
            _logger.LogWarning("Permanently deleting post {PostId}", postId);
            return await _adminRepository.DeletePostPermanentlyAsync(postId);
        }

        // USER MANAGEMENT
        public async Task<IEnumerable<AdminUserListDto>> GetAllUsersAsync(int page, int pageSize)
        {
            return await _adminRepository.GetAllUsersAsync(page, pageSize);
        }

        public async Task<int> GetTotalUsersCountAsync()
        {
            return await _adminRepository.GetTotalUsersCountAsync();
        }

        public async Task<bool> BanUserAsync(int userId)
        {
            _logger.LogWarning("Banning user {UserId}", userId);
            return await _adminRepository.ToggleUserDeleteStatusAsync(userId);
        }

        public async Task<bool> UnbanUserAsync(int userId)
        {
            _logger.LogInformation("Unbanning user {UserId}", userId);
            var user = await _adminRepository.GetUserByIdAsync(userId);
            if (user == null || !user.on_deleted) return false;

            return await _adminRepository.ToggleUserDeleteStatusAsync(userId);
        }

        public async Task<bool> AssignRoleAsync(int userId, string roleName)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                _logger.LogWarning("User {UserId} not found", userId);
                return false;
            }

            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                _logger.LogWarning("Role {RoleName} does not exist", roleName);
                return false;
            }

            var result = await _userManager.AddToRoleAsync(user, roleName);
            if (result.Succeeded)
            {
                _logger.LogInformation("Assigned role {RoleName} to user {UserId}", roleName, userId);
                return true;
            }

            _logger.LogError("Failed to assign role {RoleName} to user {UserId}", roleName, userId);
            return false;
        }

        public async Task<bool> RemoveRoleAsync(int userId, string roleName)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                _logger.LogWarning("User {UserId} not found", userId);
                return false;
            }

            var result = await _userManager.RemoveFromRoleAsync(user, roleName);
            if (result.Succeeded)
            {
                _logger.LogInformation("Removed role {RoleName} from user {UserId}", roleName, userId);
                return true;
            }

            _logger.LogError("Failed to remove role {RoleName} from user {UserId}", roleName, userId);
            return false;
        }

        // STATS
        public async Task<AdminStatsDto> GetDashboardStatsAsync()
        {
            return await _adminRepository.GetDashboardStatsAsync();
        }
    }
}
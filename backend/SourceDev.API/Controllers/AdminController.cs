using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SourceDev.API.DTOs.Admin;
using SourceDev.API.Extensions;
using SourceDev.API.Services;

namespace SourceDev.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(IAdminService adminService, ILogger<AdminController> logger)
        {
            _adminService = adminService;
            _logger = logger;
        }

        // DASHBOARD STATS
        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var stats = await _adminService.GetDashboardStatsAsync();
            return Ok(stats);
        }

        // POST MANAGEMENT
        [HttpGet("posts")]
        public async Task<IActionResult> GetAllPosts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] bool? status = null)
        {
            if (page < 1 || pageSize < 1)
                return BadRequest("Invalid paging parameters.");

            var posts = await _adminService.GetAllPostsAsync(page, pageSize, status);
            var totalCount = await _adminService.GetTotalPostsCountAsync(status);

            return Ok(new
            {
                data = posts,
                pagination = new
                {
                    page,
                    pageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                }
            });
        }

        [HttpPut("posts/{id:int}/approve")]
        public async Task<IActionResult> ApprovePost(int id)
        {
            var currentUserId = User.GetUserId();
            _logger.LogInformation("Admin {AdminId} approving post {PostId}", currentUserId, id);

            var result = await _adminService.ApprovePostAsync(id);
            if (!result) return NotFound();

            return NoContent();
        }

        [HttpPut("posts/{id:int}/reject")]
        public async Task<IActionResult> RejectPost(int id)
        {
            var currentUserId = User.GetUserId();
            _logger.LogInformation("Admin {AdminId} rejecting post {PostId}", currentUserId, id);

            var result = await _adminService.RejectPostAsync(id);
            if (!result) return NotFound();

            return NoContent();
        }

        [HttpDelete("posts/{id:int}")]
        public async Task<IActionResult> DeletePostPermanently(int id)
        {
            var currentUserId = User.GetUserId();
            _logger.LogWarning("Admin {AdminId} permanently deleting post {PostId}", currentUserId, id);

            var result = await _adminService.DeletePostPermanentlyAsync(id);
            if (!result) return NotFound();

            return NoContent();
        }

        // USER MANAGEMENT
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            if (page < 1 || pageSize < 1)
                return BadRequest("Invalid paging parameters.");

            var users = await _adminService.GetAllUsersAsync(page, pageSize);
            var totalCount = await _adminService.GetTotalUsersCountAsync();

            return Ok(new
            {
                data = users,
                pagination = new
                {
                    page,
                    pageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                }
            });
        }

        [HttpPut("users/{id:int}/ban")]
        public async Task<IActionResult> BanUser(int id)
        {
            var currentUserId = User.GetUserId();
            _logger.LogWarning("Admin {AdminId} banning user {UserId}", currentUserId, id);

            var result = await _adminService.BanUserAsync(id);
            if (!result) return NotFound();

            return NoContent();
        }

        [HttpPut("users/{id:int}/unban")]
        public async Task<IActionResult> UnbanUser(int id)
        {
            var currentUserId = User.GetUserId();
            _logger.LogInformation("Admin {AdminId} unbanning user {UserId}", currentUserId, id);

            var result = await _adminService.UnbanUserAsync(id);
            if (!result) return NotFound();

            return NoContent();
        }

        [HttpPost("users/{id:int}/roles")]
        public async Task<IActionResult> AssignRole(int id, [FromBody] UpdateUserRoleDto dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var currentUserId = User.GetUserId();
            _logger.LogInformation("Admin {AdminId} assigning role {Role} to user {UserId}",
                currentUserId, dto.Role, id);

            var result = await _adminService.AssignRoleAsync(id, dto.Role);
            if (!result)
                return BadRequest(new { message = "Failed to assign role. User or role may not exist." });

            return NoContent();
        }

        [HttpDelete("users/{id:int}/roles/{roleName}")]
        public async Task<IActionResult> RemoveRole(int id, string roleName)
        {
            var currentUserId = User.GetUserId();
            _logger.LogInformation("Admin {AdminId} removing role {Role} from user {UserId}",
                currentUserId, roleName, id);

            var result = await _adminService.RemoveRoleAsync(id, roleName);
            if (!result)
                return BadRequest(new { message = "Failed to remove role." });

            return NoContent();
        }
    }
}
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SourceDev.API.Extensions;
using SourceDev.API.Services;

namespace SourceDev.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FollowController : ControllerBase
    {
        private readonly IFollowService _followService;
        private readonly ILogger<FollowController> _logger;

        public FollowController(IFollowService followService, ILogger<FollowController> logger)
        {
            _followService = followService;
            _logger = logger;
        }

        // POST: api/follow/{userId}
        [HttpPost("{userId:int}")]
        [Authorize]
        public async Task<IActionResult> FollowUser(int userId)
        {
            var currentUserId = User.GetUserId();
            if (!currentUserId.HasValue)
                return Unauthorized();

            if (currentUserId.Value == userId)
                return BadRequest(new { message = "You cannot follow yourself" });

            var success = await _followService.FollowUserAsync(currentUserId.Value, userId);
            
            if (!success)
                return NotFound(new { message = "User not found" });

            return Ok(new { message = "User followed successfully" });
        }

        // DELETE: api/follow/{userId}
        [HttpDelete("{userId:int}")]
        [Authorize]
        public async Task<IActionResult> UnfollowUser(int userId)
        {
            var currentUserId = User.GetUserId();
            if (!currentUserId.HasValue)
                return Unauthorized();

            var success = await _followService.UnfollowUserAsync(currentUserId.Value, userId);
            
            if (!success)
                return NotFound(new { message = "Follow relationship not found" });

            return Ok(new { message = "User unfollowed successfully" });
        }

        // GET: api/follow/check/{userId}
        [HttpGet("check/{userId:int}")]
        [Authorize]
        public async Task<IActionResult> CheckIfFollowing(int userId)
        {
            var currentUserId = User.GetUserId();
            if (!currentUserId.HasValue)
                return Unauthorized();

            var isFollowing = await _followService.IsFollowingAsync(currentUserId.Value, userId);
            
            return Ok(new { isFollowing });
        }

        // GET: api/follow/followers-count/{userId}
        [HttpGet("followers-count/{userId:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFollowersCount(int userId)
        {
            var count = await _followService.GetFollowersCountAsync(userId);
            return Ok(new { count });
        }

        // GET: api/follow/following-count/{userId}
        [HttpGet("following-count/{userId:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFollowingCount(int userId)
        {
            var count = await _followService.GetFollowingCountAsync(userId);
            return Ok(new { count });
        }
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SourceDev.API.Extensions;
using SourceDev.API.Services;

namespace SourceDev.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReactionController : ControllerBase
    {
        private readonly IReactionService _reactionService;
        private readonly ILogger<ReactionController> _logger;

        public ReactionController(IReactionService reactionService, ILogger<ReactionController> logger)
        {
            _reactionService = reactionService;
            _logger = logger;
        }

        /// <summary>
        /// Toggle a reaction on a post (add if not exists, remove if exists)
        /// </summary>
        [HttpPost("post/{postId:int}")]
        [Authorize]
        public async Task<IActionResult> ToggleReaction(int postId, [FromBody] string reactionType)
        {
            if (string.IsNullOrWhiteSpace(reactionType))
                return BadRequest(new { message = "Reaction type is required" });

            var userId = User.GetUserId();
            if (!userId.HasValue)
                return Unauthorized("User ID not found in token.");

            try
            {
                var result = await _reactionService.ToggleReactionAsync(postId, userId.Value, reactionType);
                if (!result)
                    return NotFound("Post not found.");

                return Ok(new { message = "Reaction toggled successfully." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Remove a specific reaction from a post
        /// </summary>
        [HttpDelete("post/{postId:int}")]
        [Authorize]
        public async Task<IActionResult> RemoveReaction(int postId, [FromQuery] string reactionType)
        {
            if (string.IsNullOrWhiteSpace(reactionType))
                return BadRequest(new { message = "Reaction type is required" });

            var userId = User.GetUserId();
            if (!userId.HasValue)
                return Unauthorized("User ID not found in token.");

            try
            {
                var result = await _reactionService.RemoveReactionAsync(postId, userId.Value, reactionType);
                if (!result)
                    return NotFound("Reaction not found or post not found.");

                return Ok(new { message = "Reaction removed successfully." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get reaction summary for a post (counts by reaction type)
        /// </summary>
        [HttpGet("post/{postId:int}/summary")]
        [AllowAnonymous]
        public async Task<IActionResult> GetReactionSummary(int postId)
        {
            var summary = await _reactionService.GetSummaryAsync(postId);
            return Ok(summary);
        }
    }
}


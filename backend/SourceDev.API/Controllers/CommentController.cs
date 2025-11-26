using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SourceDev.API.DTOs.Comment;
using SourceDev.API.Extensions;
using SourceDev.API.Services;

namespace SourceDev.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentController : ControllerBase
    {
        private readonly ICommentService _commentService;
        private readonly ILogger<CommentController> _logger;

        public CommentController(ICommentService commentService, ILogger<CommentController> logger)
        {
            _commentService = commentService;
            _logger = logger;
        }

        /// <summary>
        /// Get comments for a post
        /// </summary>
        [HttpGet("post/{postId:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByPost(int postId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            if (page < 1 || pageSize < 1)
                return BadRequest("Invalid paging parameters.");

            var comments = await _commentService.GetByPostAsync(postId, page, pageSize);
            return Ok(comments);
        }

        /// <summary>
        /// Get comment count for a post
        /// </summary>
        [HttpGet("post/{postId:int}/count")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCountForPost(int postId)
        {
            var count = await _commentService.GetCountForPostAsync(postId);
            return Ok(new { count });
        }

        /// <summary>
        /// Add a new comment to a post
        /// </summary>
        [HttpPost("post/{postId:int}")]
        [Authorize]
        public async Task<IActionResult> AddComment(int postId, [FromBody] AddCommentRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.GetUserId();
            if (!userId.HasValue)
                return Unauthorized("User ID not found in token.");

            try
            {
                var comment = await _commentService.AddAsync(postId, userId.Value, request.Content, request.ParentCommentId);
                return Ok(comment);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }

        /// <summary>
        /// Delete a comment
        /// </summary>
        [HttpDelete("{commentId:int}")]
        [Authorize]
        public async Task<IActionResult> DeleteComment(int commentId)
        {
            var userId = User.GetUserId();
            if (!userId.HasValue)
                return Unauthorized("User ID not found in token.");

            try
            {
                var result = await _commentService.DeleteAsync(commentId, userId.Value);
                if (!result)
                    return NotFound("Comment not found.");

                return Ok(new { message = "Comment deleted successfully." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }

        /// <summary>
        /// Search comments by content
        /// </summary>
        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchComments([FromQuery] string query, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { message = "Search query cannot be empty." });

            if (page < 1 || pageSize < 1)
                return BadRequest(new { message = "Invalid paging parameters." });

            if (pageSize > 100)
                return BadRequest(new { message = "Page size cannot exceed 100." });

            var results = await _commentService.SearchCommentsAsync(query, page, pageSize);
            return Ok(results);
        }
    }
}


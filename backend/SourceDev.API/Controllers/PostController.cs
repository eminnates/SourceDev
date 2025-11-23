using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SourceDev.API.DTOs.Post;
using SourceDev.API.Extensions;
using SourceDev.API.Services;

namespace SourceDev.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PostController : ControllerBase
    {
        private readonly IPostService _postService;
        private readonly ILogger<PostController> _logger;

        public PostController(ILogger<PostController> logger, IPostService postService)
        {
            _logger = logger;
            _postService = postService;
        }
        // READ
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var currentUserId = User.GetUserId();
            var post = await _postService.GetByIdAsync(id, currentUserId);
            if (post == null) return NotFound();
            return Ok(post);
        }
        [HttpGet("slug/{slug}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            var currentUserId = User.GetUserId();
            var post = await _postService.GetBySlugAsync(slug, currentUserId);
            if (post == null) return NotFound();
            return Ok(post);
        }
        [HttpGet("latest")]
        [AllowAnonymous]
        public async Task<IActionResult> GetLatest([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            if (page < 1 || pageSize < 1) return BadRequest("Invalid paging.");
            var items = await _postService.GetLatestAsync(page, pageSize);
            return Ok(items);
        }

        [HttpGet("top")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTop([FromQuery] int take = 20)
        {
            if (take < 1) return BadRequest("Invalid take.");
            var items = await _postService.GetTopAsync(take);
            return Ok(items);
        }

        [HttpGet("relevant")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRelevant([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            if (page < 1 || pageSize < 1) return BadRequest("Invalid paging.");
            var currentUserId = User.GetUserId();
            var items = await _postService.GetRelevantAsync(currentUserId, page, pageSize);
            return Ok(items);
        }
        [HttpGet("user/{userId:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByUser(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            if (page < 1 || pageSize < 1) return BadRequest("Invalid paging.");
            var items = await _postService.GetByUserAsync(userId, page, pageSize);
            return Ok(items);
        }

        [HttpGet("drafts")]
        [Authorize]
        public async Task<IActionResult> GetMyDrafts([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            if (page < 1 || pageSize < 1) return BadRequest("Invalid paging.");
            var currentUserId = User.GetUserId();
            if (!currentUserId.HasValue) return Unauthorized();
            var items = await _postService.GetUserDraftsAsync(currentUserId.Value, page, pageSize);
            return Ok(items);
        }

        [HttpGet("tag/{tagSlug}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByTag(string tagSlug, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            if (page < 1 || pageSize < 1) return BadRequest("Invalid paging.");
            var items = await _postService.GetByTagAsync(tagSlug, page, pageSize);
            return Ok(items);
        }
        // CREATE
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreatePostDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            var currentUserId = User.GetUserId();
            _logger.LogInformation("Creating post for UserId: {UserId}", currentUserId);
            
            if (!currentUserId.HasValue) return Unauthorized();

            var created = await _postService.CreateAsync(dto, currentUserId.Value);
            return CreatedAtAction(nameof(GetBySlug), new { slug = created.Slug }, created);
        }
        // UPDATE
        [HttpPut("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePostDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            var currentUserId = User.GetUserId();
            if (!currentUserId.HasValue) return Unauthorized();

            try
            {
                var ok = await _postService.UpdateAsync(id, dto, currentUserId.Value);
                if (!ok) return NotFound();
                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }
        [HttpPut("{id:int}/publish")]
        [Authorize]
        public async Task<IActionResult> Publish(int id)
        {
            var currentUserId = User.GetUserId();
            if (!currentUserId.HasValue) return Unauthorized();

            try
            {
                var ok = await _postService.PublishAsync(id, currentUserId.Value);
                if (!ok) return NotFound();
                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }
        [HttpPut("{id:int}/unpublish")]
        [Authorize]
        public async Task<IActionResult> Unpublish(int id)
        {
            var currentUserId = User.GetUserId();
            if (!currentUserId.HasValue) return Unauthorized();

            try
            {
                var ok = await _postService.UnpublishAsync(id, currentUserId.Value);
                if (!ok) return NotFound();
                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }
        // DELETE
        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var currentUserId = User.GetUserId();
            if (!currentUserId.HasValue) return Unauthorized();

            try
            {
                var ok = await _postService.DeleteAsync(id, currentUserId.Value);
                if (!ok) return NotFound();
                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

        // INTERACTIONS
        [HttpPost("{id:int}/like")]
        [Authorize]
        public async Task<IActionResult> ToggleLike(int id)
        {
            var currentUserId = User.GetUserId();
            if (!currentUserId.HasValue) return Unauthorized();

            var ok = await _postService.ToggleLikeAsync(id, currentUserId.Value);
            if (!ok) return NotFound();
            return NoContent();
        }

        [HttpPost("{id:int}/save")]
        [Authorize]
        public async Task<IActionResult> ToggleBookmark(int id)
        {
            var currentUserId = User.GetUserId();
            if (!currentUserId.HasValue) return Unauthorized();

            var ok = await _postService.ToggleBookmarkAsync(id, currentUserId.Value);
            if (!ok) return NotFound();
            return NoContent();
        }

        [HttpPost("{id:int}/tags")]
        [Authorize]
        public async Task<IActionResult> AddTag(int id, [FromBody] string tagName)
        {
            var currentUserId = User.GetUserId();
            if (!currentUserId.HasValue) return Unauthorized();

            if (string.IsNullOrWhiteSpace(tagName))
                return BadRequest(new { message = "Tag name is required" });

            try
            {
                var ok = await _postService.AddTagToPostAsync(id, tagName, currentUserId.Value);
                if (!ok) return NotFound();
                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

        [HttpDelete("{id:int}/tags/{tagId:int}")]
        [Authorize]
        public async Task<IActionResult> RemoveTag(int id, int tagId)
        {
            var currentUserId = User.GetUserId();
            if (!currentUserId.HasValue) return Unauthorized();

            try
            {
                var ok = await _postService.RemoveTagFromPostAsync(id, tagId, currentUserId.Value);
                if (!ok) return NotFound();
                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> Search([FromQuery] string query, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            // Validation
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { message = "Search query cannot be empty." });

            if (page < 1 || pageSize < 1)
                return BadRequest(new { message = "Invalid paging parameters." });

            if (pageSize > 100)
                return BadRequest(new { message = "Page size cannot exceed 100." });

            var currentUserId = User.GetUserId();
            var results = await _postService.SearchAsync(query, currentUserId, page, pageSize);

            return Ok(results);
        }




    }
}

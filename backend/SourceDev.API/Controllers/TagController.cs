using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SourceDev.API.Services;

namespace SourceDev.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TagController : ControllerBase
    {
        private readonly ITagService _tagService;
        private readonly ILogger<TagController> _logger;

        public TagController(ITagService tagService, ILogger<TagController> logger)
        {
            _tagService = tagService;
            _logger = logger;
        }

        // GET: api/tag
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllTags()
        {
            var tags = await _tagService.GetAllTagsAsync();
            return Ok(tags);
        }

        // GET: api/tag/popular
        [HttpGet("popular")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPopularTags([FromQuery] int limit = 20)
        {
            if (limit < 1 || limit > 100)
                return BadRequest(new { message = "Limit must be between 1 and 100" });

            var tags = await _tagService.GetPopularTagsAsync(limit);
            return Ok(tags);
        }

        // GET: api/tag/search?q=react
        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchTags([FromQuery] string q, [FromQuery] int limit = 10)
        {
            if (string.IsNullOrWhiteSpace(q))
                return BadRequest(new { message = "Search query cannot be empty" });

            if (limit < 1 || limit > 50)
                return BadRequest(new { message = "Limit must be between 1 and 50" });

            var tags = await _tagService.SearchTagsAsync(q, limit);
            return Ok(tags);
        }

        // GET: api/tag/{id}
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTagById(int id)
        {
            var tag = await _tagService.GetTagByIdAsync(id);
            if (tag == null)
                return NotFound(new { message = "Tag not found" });

            return Ok(tag);
        }

        // GET: api/tag/name/{name}
        [HttpGet("name/{name}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTagByName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return BadRequest(new { message = "Tag name cannot be empty" });

            var tag = await _tagService.GetTagByNameAsync(name);
            if (tag == null)
                return NotFound(new { message = "Tag not found" });

            return Ok(tag);
        }
    }
}

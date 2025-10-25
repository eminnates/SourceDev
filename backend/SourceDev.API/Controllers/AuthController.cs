using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SourceDev.API.DTOs.Auth;
using SourceDev.API.Services;

namespace SourceDev.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ITokenBlacklistService _tokenBlacklistService;

        public AuthController(IAuthService authService, ITokenBlacklistService tokenBlacklistService)
        {
            _authService = authService;
            _tokenBlacklistService = tokenBlacklistService;
        }

        /// <summary>
        /// Register a new user
        /// </summary>
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.RegisterAsync(registerDto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Login with email/username and password
        /// </summary>
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.LoginAsync(loginDto);

            if (!result.Success)
                return Unauthorized(result);

            return Ok(result);
        }

        /// <summary>
        /// Change password (requires authentication)
        /// </summary>
        [Authorize]
        [HttpPost("change-password")]
        public async Task<ActionResult<AuthResponseDto>> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            if (userId == 0)
                return Unauthorized(new { message = "Invalid token" });

            var result = await _authService.ChangePasswordAsync(userId, changePasswordDto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Validate JWT token
        /// </summary>
        [HttpPost("validate-token")]
        public async Task<ActionResult> ValidateToken([FromBody] string token)
        {
            var isValid = await _authService.ValidateTokenAsync(token);

            if (!isValid)
                return Unauthorized(new { message = "Invalid token" });

            return Ok(new { message = "Token is valid" });
        }

        /// <summary>
        /// Logout (adds token to blacklist)
        /// </summary>
        [Authorize]
        [HttpPost("logout")]
        public async Task<ActionResult> Logout()
        {
            // Token'ı Authorization header'ından al
            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            
            // Token'ı blacklist'e ekle
            await _tokenBlacklistService.AddToBlacklistAsync(token);
            
            var username = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            
            return Ok(new 
            { 
                success = true,
                message = $"User {username} logged out successfully. Token is now blacklisted.",
                timestamp = DateTime.UtcNow
            });
        }

        /// <summary>
        /// Get current user info (requires authentication)
        /// </summary>
        [Authorize]
        [HttpGet("me")]
        public ActionResult GetCurrentUser()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var username = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var displayName = User.FindFirst("DisplayName")?.Value;

            return Ok(new
            {
                userId,
                username,
                email,
                displayName
            });
        }
    }
}

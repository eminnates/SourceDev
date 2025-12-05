using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SourceDev.API.Configuration;
using SourceDev.API.DTOs.Auth;
using SourceDev.API.Models.Entities;
using SourceDev.API.Repositories;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SourceDev.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITokenBlacklistService _tokenBlacklistService;
        private readonly ILogger<AuthService> _logger;
        private readonly string _jwtSecret;
        private readonly string _jwtIssuer;
        private readonly string _jwtAudience;
        private readonly int _jwtExpiration;

        public AuthService(UserManager<User> userManager, IConfiguration configuration, SignInManager<User> signInManager, IMapper mapper, IUnitOfWork unitOfWork, ITokenBlacklistService tokenBlacklistService, ILogger<AuthService> logger)
        {
            _userManager = userManager;
            _configuration = configuration;
            _signInManager = signInManager;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _tokenBlacklistService = tokenBlacklistService;
            _logger = logger;
            _jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
            ?? throw new InvalidOperationException("JWT_SECRET_KEY not found!");
            _jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER")
                ?? throw new InvalidOperationException("JWT_ISSUER not found!");
            _jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE")
                ?? throw new InvalidOperationException("JWT_AUDIENCE not found!");
            _jwtExpiration = int.TryParse(Environment.GetEnvironmentVariable("JWT_EXPIRATION_MINUTES"), out var exp)
                ? exp : 60;
        }



        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            // Check if user exists
            var existingUser = await _userManager.FindByEmailAsync(registerDto.Email);
            if (existingUser != null)
            {
                _logger.LogWarning("Registration failed: Email already registered. Email: {Email}", registerDto.Email);
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Email already registered"
                };
            }

            existingUser = await _userManager.FindByNameAsync(registerDto.Username);
            if (existingUser != null)
            {
                _logger.LogWarning("Registration failed: Username already taken. Username: {Username}", registerDto.Username);
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Username already taken"
                };
            }

            // Create new user
            var user = new User
            {
                UserName = registerDto.Username,
                Email = registerDto.Email,
                display_name = registerDto.DisplayName,
                bio = registerDto.Bio ?? string.Empty,
                created_at = DateTime.UtcNow,
                updated_at = DateTime.UtcNow,
                on_deleted = false
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                _logger.LogError("Registration failed: User creation error. Errors: {Errors}", errors);
                return new AuthResponseDto
                {
                    Success = false,
                    Message = errors
                };
            }

            // Generate token
            var token = GenerateJwtToken(user);
            var expiration = DateTime.UtcNow.AddMinutes(_jwtExpiration);

            _logger.LogInformation("User registered successfully. UserId: {UserId}, Username: {Username}", user.Id, user.UserName);

            return new AuthResponseDto
            {
                Success = true,
                Message = "Registration successful",
                Token = token,
                TokenExpiration = expiration,
                User = _mapper.Map<UserInfoDto>(user)
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            // Find user by email or username
            var user = await _userManager.FindByEmailAsync(loginDto.EmailOrUsername)
                ?? await _userManager.FindByNameAsync(loginDto.EmailOrUsername);

            if (user == null)
            {
                _logger.LogWarning("Login failed: User not found. Input: {Input}", loginDto.EmailOrUsername);
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid credentials"
                };
            }

            // Check if deleted
            if (user.on_deleted)
            {
                _logger.LogWarning("Login failed: Account deleted. UserId: {UserId}", user.Id);
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Account has been deleted"
                };
            }

            // Check password
            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

            if (!result.Succeeded)
            {
                _logger.LogWarning("Login failed: Invalid password. UserId: {UserId}", user.Id);
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid credentials"
                };
            }

            // Generate token
            var token = GenerateJwtToken(user);
            var expiration = DateTime.UtcNow.AddMinutes(_jwtExpiration);

            _logger.LogInformation("User logged in successfully. UserId: {UserId}", user.Id);

            return new AuthResponseDto
            {
                Success = true,
                Message = "Login successful",
                Token = token,
                TokenExpiration = expiration,
                User = _mapper.Map<UserInfoDto>(user)
            };
        }

        public async Task<AuthResponseDto> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "User not found"
                };
            }

            var result = await _userManager.ChangePasswordAsync(
                user,
                changePasswordDto.CurrentPassword,
                changePasswordDto.NewPassword);

            if (!result.Succeeded)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = string.Join(", ", result.Errors.Select(e => e.Description))
                };
            }

            return new AuthResponseDto
            {
                Success = true,
                Message = "Password changed successfully"
            };
        }

        public async Task<AuthResponseDto> UpdateProfileAsync(int userId, UpdateProfileDto updateProfileDto)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "User not found"
                };
            }


            user.display_name = updateProfileDto.DisplayName;
            user.bio = updateProfileDto.Bio ?? string.Empty;
            user.profile_img_url = updateProfileDto.ProfileImageUrl;
            user.updated_at = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = string.Join(", ", result.Errors.Select(e => e.Description))
                };
            }

            return new AuthResponseDto
            {
                Success = true,
                Message = "Profile updated successfully",
                User = _mapper.Map<UserInfoDto>(user)
            };
        }

        public Task<bool> ValidateTokenAsync(string token)
            {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_jwtSecret);

                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _jwtIssuer,
                    ValidateAudience = true,
                    ValidAudience = _jwtAudience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out _);

                return Task.FromResult(true);
            }
            catch
            {
                return Task.FromResult(false);
            }
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email!),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.UserName!),
                new Claim("DisplayName", user.display_name)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtIssuer,
                audience: _jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtExpiration),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

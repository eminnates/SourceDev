using SourceDev.API.DTOs.Auth;

namespace SourceDev.API.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
        Task<AuthResponseDto> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto);
        Task<bool> ValidateTokenAsync(string token);
    }
}

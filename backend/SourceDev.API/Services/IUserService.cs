using SourceDev.API.DTOs.User;
using SourceDev.API.Models.Entities;

namespace SourceDev.API.Services
{
    public interface IUserService
    {
        Task<User?> GetUserByIdAsync(int id);
        Task<UserDto?> GetUserDtoByIdAsync(int id);
        Task<User?> GetUserByEmailAsync(string email);
        Task<User?> GetUserByUsernameAsync(string username);
        Task<IEnumerable<UserDto>> GetAllUsersAsync(int page = 1, int pageSize = 20);
        Task<IEnumerable<UserDto>> GetActiveUsersAsync();
        Task<IEnumerable<UserDto>> SearchUsersAsync(string searchTerm);
        Task<User> UpdateUserAsync(User user);
        Task<bool> DeleteUserAsync(int id);
        Task<bool> FollowUserAsync(int id);
        Task<bool> IsEmailAvailableAsync(string email);
        Task<bool> IsUsernameAvailableAsync(string username);
    }
}

using SourceDev.API.Models.Entities;

namespace SourceDev.API.Repositories
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByUsernameAsync(string username);
        Task<bool> IsEmailExistsAsync(string email);
        Task<bool> IsUsernameExistsAsync(string username);
        Task<IEnumerable<User>> GetActiveUsersAsync();
        Task<IEnumerable<User>> SearchUsersByDisplayNameAsync(string searchTerm);
        Task<int> GetFollowersCountAsync(int userId);
        Task<int> GetFollowingCountAsync(int userId);
    }
}

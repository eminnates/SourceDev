using SourceDev.API.Models.Entities;
using SourceDev.API.Repositories;

namespace SourceDev.API.Services
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;

        public UserService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _unitOfWork.Users.GetByIdAsync(id);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _unitOfWork.Users.GetByEmailAsync(email);
        }

        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            return await _unitOfWork.Users.GetByUsernameAsync(username);
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _unitOfWork.Users.GetAllAsync();
        }

        public async Task<IEnumerable<User>> GetActiveUsersAsync()
        {
            return await _unitOfWork.Users.GetActiveUsersAsync();
        }

        public async Task<IEnumerable<User>> SearchUsersAsync(string searchTerm)
        {
            return await _unitOfWork.Users.SearchUsersByDisplayNameAsync(searchTerm);
        }

        public async Task<User> UpdateUserAsync(User user)
        {
            user.updated_at = DateTime.UtcNow;
            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChangesAsync();
            return user;
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null)
                return false;

            // Soft delete
            user.on_deleted = true;
            user.updated_at = DateTime.UtcNow;
            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChangesAsync();
            
            return true;
        }

        public async Task<bool> IsEmailAvailableAsync(string email)
        {
            return !await _unitOfWork.Users.IsEmailExistsAsync(email);
        }

        public async Task<bool> IsUsernameAvailableAsync(string username)
        {
            return !await _unitOfWork.Users.IsUsernameExistsAsync(username);
        }
    }
}

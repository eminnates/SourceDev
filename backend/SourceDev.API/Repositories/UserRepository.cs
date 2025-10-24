using Microsoft.EntityFrameworkCore;
using SourceDev.API.Data.Context;
using SourceDev.API.Models.Entities;

namespace SourceDev.API.Repositories
{
    public class UserRepository : Repository<User>, IUserRepository
    {
        public UserRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _dbSet.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _dbSet.FirstOrDefaultAsync(u => u.UserName == username);
        }

        public async Task<bool> IsEmailExistsAsync(string email)
        {
            return await _dbSet.AnyAsync(u => u.Email == email);
        }

        public async Task<bool> IsUsernameExistsAsync(string username)
        {
            return await _dbSet.AnyAsync(u => u.UserName == username);
        }

        public async Task<IEnumerable<User>> GetActiveUsersAsync()
        {
            return await _dbSet.Where(u => !u.on_deleted).ToListAsync();
        }

        public async Task<IEnumerable<User>> SearchUsersByDisplayNameAsync(string searchTerm)
        {
            return await _dbSet
                .Where(u => !u.on_deleted && u.display_name.Contains(searchTerm))
                .ToListAsync();
        }
    }
}

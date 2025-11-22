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
            return await _dbSet.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _dbSet.AsNoTracking().FirstOrDefaultAsync(u => u.UserName == username);
        }

        public async Task<bool> IsEmailExistsAsync(string email)
        {
            return await _dbSet.AsNoTracking().AnyAsync(u => u.Email == email);
        }

        public async Task<bool> IsUsernameExistsAsync(string username)
        {
            return await _dbSet.AsNoTracking().AnyAsync(u => u.UserName == username);
        }

        public async Task<IEnumerable<User>> GetActiveUsersAsync()
        {
            return await _dbSet.AsNoTracking().Where(u => !u.on_deleted).ToListAsync();
        }

        public async Task<IEnumerable<User>> SearchUsersByDisplayNameAsync(string searchTerm)
        {
            return await _dbSet
                .AsNoTracking()
                .Where(u => !u.on_deleted && u.display_name.Contains(searchTerm))
                .ToListAsync();
        }

        public async Task<int> GetFollowersCountAsync(int userId)
        {
            return await _context.UserFollows
                .AsNoTracking()
                .CountAsync(uf => uf.following_id == userId);
        }

        public async Task<int> GetFollowingCountAsync(int userId)
        {
            return await _context.UserFollows
                .AsNoTracking()
                .CountAsync(uf => uf.follower_id == userId);
        }
    }
}

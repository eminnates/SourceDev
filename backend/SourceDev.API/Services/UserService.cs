using SourceDev.API.DTOs.User;
using SourceDev.API.Models.Entities;
using SourceDev.API.Repositories;
using System.Linq;

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

        public async Task<UserDto?> GetUserDtoByIdAsync(int id)
        {
            var userTask = _unitOfWork.Users.GetByIdAsync(id);
            var followersCountTask = _unitOfWork.Users.GetFollowersCountAsync(id);
            var followingCountTask = _unitOfWork.Users.GetFollowingCountAsync(id);

            await Task.WhenAll(userTask, followersCountTask, followingCountTask);

            var user = await userTask;
            if (user == null || user.on_deleted)
                return null;

            return new UserDto
            {
                Id = user.Id,
                Username = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                DisplayName = user.display_name,
                Bio = user.bio,
                ProfileImageUrl = user.profile_img_url,
                CreatedAt = user.created_at,
                FollowersCount = await followersCountTask,
                FollowingCount = await followingCountTask
            };
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _unitOfWork.Users.GetByEmailAsync(email);
        }

        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            return await _unitOfWork.Users.GetByUsernameAsync(username);
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = (await _unitOfWork.Users.GetAllAsync())
                .Where(u => !u.on_deleted)
                .ToList();

            if (!users.Any())
                return Enumerable.Empty<UserDto>();

            var userIds = users.Select(u => u.Id).ToList();

            // Run follower/following count queries sequentially to avoid DbContext concurrency issues
            var followersCounts = await _unitOfWork.Users.GetFollowersCountsAsync(userIds);
            var followingCounts = await _unitOfWork.Users.GetFollowingCountsAsync(userIds);

            var userDtos = new List<UserDto>(users.Count);

            foreach (var user in users)
            {
                followersCounts.TryGetValue(user.Id, out var followersCount);
                followingCounts.TryGetValue(user.Id, out var followingCount);

                userDtos.Add(new UserDto
                {
                    Id = user.Id,
                    Username = user.UserName ?? string.Empty,
                    DisplayName = user.display_name,
                    Bio = user.bio,
                    ProfileImageUrl = user.profile_img_url,
                    CreatedAt = user.created_at,
                    FollowersCount = followersCount,
                    FollowingCount = followingCount
                });
            }

            return userDtos;
        }

        public async Task<IEnumerable<UserDto>> GetActiveUsersAsync()
        {
            var users = (await _unitOfWork.Users.GetActiveUsersAsync()).ToList();

            if (!users.Any())
                return Enumerable.Empty<UserDto>();

            var userIds = users.Select(u => u.Id).ToList();

            // Run follower/following count queries sequentially to avoid DbContext concurrency issues
            var followersCounts = await _unitOfWork.Users.GetFollowersCountsAsync(userIds);
            var followingCounts = await _unitOfWork.Users.GetFollowingCountsAsync(userIds);

            var userDtos = new List<UserDto>(users.Count);

            foreach (var user in users)
            {
                followersCounts.TryGetValue(user.Id, out var followersCount);
                followingCounts.TryGetValue(user.Id, out var followingCount);

                userDtos.Add(new UserDto
                {
                    Id = user.Id,
                    Username = user.UserName ?? string.Empty,
                    DisplayName = user.display_name,
                    Bio = user.bio,
                    ProfileImageUrl = user.profile_img_url,
                    CreatedAt = user.created_at,
                    FollowersCount = followersCount,
                    FollowingCount = followingCount
                });
            }

            return userDtos;
        }

        public async Task<IEnumerable<UserDto>> SearchUsersAsync(string searchTerm)
        {
            var users = (await _unitOfWork.Users.SearchUsersByDisplayNameAsync(searchTerm))
                .Where(u => !u.on_deleted)
                .ToList();

            if (!users.Any())
                return Enumerable.Empty<UserDto>();

            var userIds = users.Select(u => u.Id).ToList();

            // Run follower/following count queries sequentially to avoid DbContext concurrency issues
            var followersCounts = await _unitOfWork.Users.GetFollowersCountsAsync(userIds);
            var followingCounts = await _unitOfWork.Users.GetFollowingCountsAsync(userIds);

            var userDtos = new List<UserDto>(users.Count);

            foreach (var user in users)
            {
                followersCounts.TryGetValue(user.Id, out var followersCount);
                followingCounts.TryGetValue(user.Id, out var followingCount);

                userDtos.Add(new UserDto
                {
                    Id = user.Id,
                    Username = user.UserName ?? string.Empty,
                    DisplayName = user.display_name,
                    Bio = user.bio,
                    ProfileImageUrl = user.profile_img_url,
                    CreatedAt = user.created_at,
                    FollowersCount = followersCount,
                    FollowingCount = followingCount
                });
            }

            return userDtos;
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

        public Task<bool> FollowUserAsync(int id)
        {
            throw new NotImplementedException();
        }
    }
}

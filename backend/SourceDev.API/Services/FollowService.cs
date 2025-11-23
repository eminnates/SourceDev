using Microsoft.EntityFrameworkCore;
using SourceDev.API.Data.Context;
using SourceDev.API.Models.Entities;
using SourceDev.API.Repositories;

namespace SourceDev.API.Services
{
    public class FollowService : IFollowService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly AppDbContext _context;
        private readonly ILogger<FollowService> _logger;

        public FollowService(IUnitOfWork unitOfWork, AppDbContext context, ILogger<FollowService> logger)
        {
            _unitOfWork = unitOfWork;
            _context = context;
            _logger = logger;
        }

        public async Task<bool> FollowUserAsync(int followerId, int followingId)
        {
            // Kendini takip edemez
            if (followerId == followingId)
            {
                _logger.LogWarning("User tried to follow themselves. UserId: {UserId}", followerId);
                return false;
            }

            // Takip edilecek kullanıcı var mı kontrol et
            var userToFollow = await _unitOfWork.Users.GetByIdAsync(followingId);
            if (userToFollow == null)
            {
                _logger.LogWarning("User to follow not found. FollowingId: {FollowingId}", followingId);
                return false;
            }

            // Zaten takip ediyor mu kontrol et
            var existingFollow = await _unitOfWork.UserFollows
                .FirstOrDefaultAsync(uf => uf.follower_id == followerId && uf.following_id == followingId);

            if (existingFollow != null)
            {
                _logger.LogInformation("Already following. FollowerId: {FollowerId}, FollowingId: {FollowingId}", 
                    followerId, followingId);
                return true; // Zaten takip ediyor
            }

            // Yeni takip kaydı oluştur
            var userFollow = new UserFollow
            {
                follower_id = followerId,
                following_id = followingId,
                created_at = DateTime.UtcNow
            };

            await _unitOfWork.UserFollows.AddAsync(userFollow);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("User followed successfully. FollowerId: {FollowerId}, FollowingId: {FollowingId}", 
                followerId, followingId);

            return true;
        }

        public async Task<bool> UnfollowUserAsync(int followerId, int followingId)
        {
            var existingFollow = await _unitOfWork.UserFollows
                .FirstOrDefaultAsync(uf => uf.follower_id == followerId && uf.following_id == followingId);

            if (existingFollow == null)
            {
                _logger.LogWarning("Follow relationship not found. FollowerId: {FollowerId}, FollowingId: {FollowingId}", 
                    followerId, followingId);
                return false;
            }

            _unitOfWork.UserFollows.Delete(existingFollow);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("User unfollowed successfully. FollowerId: {FollowerId}, FollowingId: {FollowingId}", 
                followerId, followingId);

            return true;
        }

        public async Task<bool> IsFollowingAsync(int followerId, int followingId)
        {
            var existingFollow = await _context.UserFollows
                .AsNoTracking()
                .FirstOrDefaultAsync(uf => uf.follower_id == followerId && uf.following_id == followingId);

            return existingFollow != null;
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

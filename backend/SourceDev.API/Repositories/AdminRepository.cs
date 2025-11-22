using Microsoft.EntityFrameworkCore;
using SourceDev.API.Data.Context;
using SourceDev.API.DTOs.Admin;
using SourceDev.API.Models.Entities;

namespace SourceDev.API.Repositories
{
    public class AdminRepository : IAdminRepository
    {
        private readonly AppDbContext _context;

        public AdminRepository(AppDbContext context)
        {
            _context = context;
        }

        // POST MANAGEMENT
        public async Task<IEnumerable<AdminPostListDto>> GetAllPostsAsync(int page, int pageSize, bool? status = null)
        {
            var query = _context.Posts.AsNoTracking().AsQueryable();

            if (status.HasValue)
            {
                query = query.Where(p => p.status == status.Value);
            }

            return await query
                .AsNoTracking()
                .OrderByDescending(p => p.created_at)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new AdminPostListDto
                {
                    Id = p.post_id,
                    Slug = p.slug,
                    Excerpt = p.content_markdown.Length > 200
                        ? p.content_markdown.Substring(0, 200)
                        : p.content_markdown,
                    AuthorId = p.user_id,
                    AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                    Status = p.status,
                    Likes = p.likes_count,
                    Views = p.view_count,
                    Bookmarks = p.bookmarks_count,
                    PublishedAt = p.published_at,
                    CreatedAt = p.created_at,
                    UpdatedAt = p.updated_at,
                    Tags = p.PostTags.Select(pt => pt.Tag.name).ToList()
                })
                .ToListAsync();
        }

        public async Task<int> GetTotalPostsCountAsync(bool? status = null)
        {
            var query = _context.Posts.AsNoTracking().AsQueryable();

            if (status.HasValue)
            {
                query = query.Where(p => p.status == status.Value);
            }

            return await query.CountAsync();
        }

        public async Task<Post?> GetPostByIdForAdminAsync(int postId)
        {
            return await _context.Posts
                .AsNoTracking()
                .Include(p => p.User)
                .Include(p => p.PostTags)
                    .ThenInclude(pt => pt.Tag)
                .FirstOrDefaultAsync(p => p.post_id == postId);
        }

        public async Task<bool> UpdatePostStatusAsync(int postId, bool status)
        {
            var post = await _context.Posts.FindAsync(postId);
            if (post == null) return false;

            post.status = status;
            post.updated_at = DateTime.UtcNow;

            if (status && post.published_at == null)
            {
                post.published_at = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeletePostPermanentlyAsync(int postId)
        {
            var post = await _context.Posts.FindAsync(postId);
            if (post == null) return false;

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();
            return true;
        }

        // USER MANAGEMENT
        public async Task<IEnumerable<AdminUserListDto>> GetAllUsersAsync(int page, int pageSize)
        {
            return await _context.Users
                .AsNoTracking()
                .OrderByDescending(u => u.created_at)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new AdminUserListDto
                {
                    Id = u.Id,
                    UserName = u.UserName ?? string.Empty,
                    Email = u.Email ?? string.Empty,
                    DisplayName = u.display_name,
                    EmailConfirmed = u.EmailConfirmed,
                    OnDeleted = u.on_deleted,
                    CreatedAt = u.created_at,
                    Roles = _context.UserRoles
                        .Where(ur => ur.UserId == u.Id)
                        .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name ?? string.Empty)
                        .ToList(),
                    PostCount = _context.Posts.Count(p => p.user_id == u.Id),
                    FollowerCount = u.Followers.Count,
                    FollowingCount = u.Following.Count
                })
                .ToListAsync();
        }

        public async Task<int> GetTotalUsersCountAsync()
        {
            return await _context.Users.AsNoTracking().CountAsync();
        }

        public async Task<User?> GetUserByIdAsync(int userId)
        {
            return await _context.Users
                .AsNoTracking()
                .Include(u => u.Followers)
                .Include(u => u.Following)
                .FirstOrDefaultAsync(u => u.Id == userId);
        }

        public async Task<bool> ToggleUserDeleteStatusAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.on_deleted = !user.on_deleted;
            user.updated_at = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        // STATS
        public async Task<AdminStatsDto> GetDashboardStatsAsync()
        {
            var today = DateTime.UtcNow.Date;

            return new AdminStatsDto
            {
                TotalUsers = await _context.Users.AsNoTracking().CountAsync(),
                TotalPosts = await _context.Posts.AsNoTracking().CountAsync(),
                PublishedPosts = await _context.Posts.AsNoTracking().CountAsync(p => p.status),
                DraftPosts = await _context.Posts.AsNoTracking().CountAsync(p => !p.status),
                TotalTags = await _context.Tags.AsNoTracking().CountAsync(),
                TodayPosts = await _context.Posts.AsNoTracking().CountAsync(p => p.created_at >= today),
                TodayUsers = await _context.Users.AsNoTracking().CountAsync(u => u.created_at >= today),
                TotalViews = await _context.Posts.AsNoTracking().SumAsync(p => (long?)p.view_count) ?? 0,
                TotalLikes = await _context.Posts.AsNoTracking().SumAsync(p => (int?)p.likes_count) ?? 0
            };
        }
    }
}
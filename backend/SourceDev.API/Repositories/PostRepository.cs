using Microsoft.EntityFrameworkCore;
using SourceDev.API.Data.Context;
using SourceDev.API.Models.Entities;
using SourceDev.API.DTOs.Post;
using System.Linq.Expressions;
using SourceDev.API.Models;

namespace SourceDev.API.Repositories
{
    public class PostRepository : Repository<Post>, IPostRepository
    {
        public PostRepository(AppDbContext context) : base(context)
        {
        }

        public override async Task<Post?> GetByIdAsync(int id)
        {
            return await _dbSet.FirstOrDefaultAsync(p => p.post_id == id && p.status);
        }

        public async Task<Post?> GetByIdWithDetailsAsync(int id)
        {
            return await _dbSet
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.post_id == id && p.status);
        }

        public async Task<Post?> GetBySlugAsync(string slug)
        {
            return await _dbSet.FirstOrDefaultAsync(p => p.slug == slug && p.status);
        }

        public async Task<PostDto?> GetDtoByIdAsync(int id)
        {
            return await _dbSet
                .Where(p => p.post_id == id)
                .Select(p => new PostDto
                {
                    Id = p.post_id,
                    Slug = p.slug,
                    ContentMarkdown = p.content_markdown,
                    CoverImageUrl = p.cover_img_url,
                    AuthorId = p.user_id,
                    AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                    Status = p.status,
                    PublishedAt = p.published_at,
                    CreatedAt = p.created_at,
                    UpdatedAt = p.updated_at,
                    LikesCount = p.likes_count,
                    ViewCount = p.view_count,
                    BookmarksCount = p.bookmarks_count,
                    Tags = p.PostTags.Select(pt => pt.Tag.name).ToList()
                })
                .FirstOrDefaultAsync();
        }

        public async Task<PostDto?> GetDtoBySlugAsync(string slug)
        {
            return await _dbSet
                .Where(p => p.slug == slug && p.status)
                .Select(p => new PostDto
                {
                    Id = p.post_id,
                    Slug = p.slug,
                    ContentMarkdown = p.content_markdown,
                    CoverImageUrl = p.cover_img_url,
                    AuthorId = p.user_id,
                    AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                    Status = p.status,
                    PublishedAt = p.published_at,
                    CreatedAt = p.created_at,
                    UpdatedAt = p.updated_at,
                    LikesCount = p.likes_count,
                    ViewCount = p.view_count,
                    BookmarksCount = p.bookmarks_count,
                    Tags = p.PostTags.Select(pt => pt.Tag.name).ToList()
                })
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<Post>> GetLatestAsync(int take = 10)
        {
            return await _dbSet
                .Where(p => p.status)
                .OrderByDescending(p => p.published_at)
                .Take(take)
                .ToListAsync();
        }

        public async Task<IEnumerable<PostListDto>> GetLatestDtosAsync(int page = 1, int pageSize = 20)
        {
            return await _dbSet
                .Where(p => p.status)
                .OrderByDescending(p => p.published_at)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PostListDto
                {
                    Id = p.post_id,
                    Slug = p.slug,
                    Excerpt = p.content_markdown.Length > 200 ? p.content_markdown.Substring(0, 200) : p.content_markdown,
                    Likes = p.likes_count,
                    Views = p.view_count,
                    Bookmarks = p.bookmarks_count,
                    PublishedAt = p.published_at,
                    AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                    Tags = p.PostTags.Select(pt => pt.Tag.name).ToList()
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<Post>> GetTopAsync(int take = 10)
        {
            return await _dbSet
                .Where(p => p.status)
                .OrderByDescending(p => p.likes_count)
                .Take(take)
                .ToListAsync();
        }

        public async Task<IEnumerable<PostListDto>> GetTopDtosAsync(int take = 10)
        {
            return await _dbSet
                .Where(p => p.status)
                .OrderByDescending(p => p.likes_count)
                .Take(take)
                .Select(p => new PostListDto
                {
                    Id = p.post_id,
                    Slug = p.slug,
                    Excerpt = p.content_markdown.Length > 200 ? p.content_markdown.Substring(0, 200) : p.content_markdown,
                    Likes = p.likes_count,
                    Views = p.view_count,
                    Bookmarks = p.bookmarks_count,
                    PublishedAt = p.published_at,
                    AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                    Tags = p.PostTags.Select(pt => pt.Tag.name).ToList()
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<Post>> GetByUserAsync(int userId, int page = 1, int pageSize = 20)
        {
            return await _dbSet
                .Where(p => p.user_id == userId && p.status)
                .OrderByDescending(p => p.published_at)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IEnumerable<PostListDto>> GetByUserDtosAsync(int userId, int page = 1, int pageSize = 20)
        {
            return await _dbSet
                .Where(p => p.user_id == userId && p.status)
                .OrderByDescending(p => p.published_at)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PostListDto
                {
                    Id = p.post_id,
                    Slug = p.slug,
                    Excerpt = p.content_markdown.Length > 200 ? p.content_markdown.Substring(0, 200) : p.content_markdown,
                    Likes = p.likes_count,
                    Views = p.view_count,
                    Bookmarks = p.bookmarks_count,
                    PublishedAt = p.published_at,
                    AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                    Tags = p.PostTags.Select(pt => pt.Tag.name).ToList()
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<Post>> GetByTagSlugAsync(string tagSlug, int page = 1, int pageSize = 20)
        {
            var posts = await _context.PostTags
                .Include(pt => pt.Post)
                .Include(pt => pt.Tag)
                .Where(pt => pt.Tag != null && pt.Post != null && pt.Tag.name == tagSlug && pt.Post.status)
                .Select(pt => pt.Post!)
                .OrderByDescending(p => p.published_at)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return posts;
        }

        public async Task<IEnumerable<PostListDto>> GetByTagDtosAsync(string tagSlug, int page = 1, int pageSize = 20)
        {
            return await _context.PostTags
                .Include(pt => pt.Post)
                    .ThenInclude(p => p.User)
                .Include(pt => pt.Post)
                    .ThenInclude(p => p.PostTags)
                        .ThenInclude(pt2 => pt2.Tag)
                .Include(pt => pt.Tag)
                .Where(pt => pt.Tag != null && pt.Post != null && pt.Tag.name == tagSlug && pt.Post.status)
                .Select(pt => pt.Post!)
                .OrderByDescending(p => p.published_at)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PostListDto
                {
                    Id = p.post_id,
                    Slug = p.slug,
                    Excerpt = p.content_markdown.Length > 200 ? p.content_markdown.Substring(0, 200) : p.content_markdown,
                    Likes = p.likes_count,
                    Views = p.view_count,
                    Bookmarks = p.bookmarks_count,
                    PublishedAt = p.published_at,
                    AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                    Tags = p.PostTags.Select(pt => pt.Tag.name).ToList()
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<Post>> GetRelevantAsync(int? userId, int page = 1, int pageSize = 20)
        {
            if (userId == null)
            {
                return await _dbSet
                    .Where(p => p.status)
                    .OrderByDescending(p => p.published_at)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
            }

            var followingIds = await _context.UserFollows
                .Where(uf => uf.follower_id == userId.Value)
                .Select(uf => uf.following_id)
                .ToListAsync();

            var query = _dbSet.Where(p => p.status && followingIds.Contains(p.user_id));

            var results = await query
                .OrderByDescending(p => p.published_at)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (results.Count < pageSize)
            {
                var needed = pageSize - results.Count;
                var extras = await _dbSet
                    .Where(p => p.status && !followingIds.Contains(p.user_id))
                    .OrderByDescending(p => p.published_at)
                    .Take(needed)
                    .ToListAsync();

                results.AddRange(extras);
            }

            return results;
        }

        // DTO-returning projection for relevant feed
        public async Task<IEnumerable<PostListDto>> GetRelevantDtosAsync(int? userId, int page = 1, int pageSize = 20)
        {
            if (userId == null)
            {
                return await _dbSet
                    .Where(p => p.status)
                    .OrderByDescending(p => p.published_at)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(p => new PostListDto
                    {
                        Id = p.post_id,
                        Slug = p.slug,
                        Excerpt = p.content_markdown.Length > 200 ? p.content_markdown.Substring(0, 200) : p.content_markdown,
                        Likes = p.likes_count,
                        Views = p.view_count,
                        Bookmarks = p.bookmarks_count,
                        PublishedAt = p.published_at,
                        AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                        Tags = p.PostTags.Select(pt => pt.Tag.name).ToList()
                    })
                    .ToListAsync();
            }

            var followingIds = await _context.UserFollows
                .Where(uf => uf.follower_id == userId.Value)
                .Select(uf => uf.following_id)
                .ToListAsync();

            var results = await _dbSet
                .Where(p => p.status && followingIds.Contains(p.user_id))
                .OrderByDescending(p => p.published_at)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PostListDto
                {
                    Id = p.post_id,
                    Slug = p.slug,
                    Excerpt = p.content_markdown.Length > 200 ? p.content_markdown.Substring(0, 200) : p.content_markdown,
                    Likes = p.likes_count,
                    Views = p.view_count,
                    Bookmarks = p.bookmarks_count,
                    PublishedAt = p.published_at,
                    AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                    Tags = p.PostTags.Select(pt => pt.Tag.name).ToList()
                })
                .ToListAsync();

            if (results.Count < pageSize)
            {
                var needed = pageSize - results.Count;
                var extras = await _dbSet
                    .Where(p => p.status && !followingIds.Contains(p.user_id))
                    .OrderByDescending(p => p.published_at)
                    .Take(needed)
                    .Select(p => new PostListDto
                    {
                        Id = p.post_id,
                        Slug = p.slug,
                        Excerpt = p.content_markdown.Length > 200 ? p.content_markdown.Substring(0, 200) : p.content_markdown,
                        Likes = p.likes_count,
                        Views = p.view_count,
                        Bookmarks = p.bookmarks_count,
                        PublishedAt = p.published_at,
                        AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                        Tags = p.PostTags.Select(pt => pt.Tag.name).ToList()
                    })
                    .ToListAsync();

                results.AddRange(extras);
            }

            return results;
        }

        public async Task<IEnumerable<PostListDto>> SearchInDbAsync(string query, int? userId, int page = 1, int pageSize = 20)
        {
            var postsQuery = _dbSet.AsQueryable().Where(p => p.status);

            if (userId.HasValue)
            {
                var followingIds = await _context.UserFollows
                    .Where(uf => uf.follower_id == userId.Value)
                    .Select(uf => uf.following_id)
                    .ToListAsync();

                postsQuery = postsQuery.OrderByDescending(p => followingIds.Contains(p.user_id))
                                       .ThenByDescending(p => p.published_at);
            }
            else
            {
                postsQuery = postsQuery.OrderByDescending(p => p.published_at);
            }

            postsQuery = postsQuery
                .Where(p => p.slug.Contains(query) || p.content_markdown.Contains(query));

            return await postsQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PostListDto
                {
                    Id = p.post_id,
                    Slug = p.slug,
                    Excerpt = p.content_markdown.Length > 200 ? p.content_markdown.Substring(0, 200) : p.content_markdown,
                    Likes = p.likes_count,
                    Views = p.view_count,
                    Bookmarks = p.bookmarks_count,
                    PublishedAt = p.published_at,
                    AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                    Tags = p.PostTags.Select(pt => pt.Tag.name).ToList()
                })
                .ToListAsync();
        }


    }
}


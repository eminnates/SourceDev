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
            return await _dbSet.AsNoTracking().FirstOrDefaultAsync(p => p.post_id == id && p.status);
        }

        public async Task<Post?> GetByIdWithDetailsAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.post_id == id && p.status);
        }

        public async Task<Post?> GetBySlugAsync(string slug)
        {
            return await _dbSet.AsNoTracking().FirstOrDefaultAsync(p => p.slug == slug && p.status);
        }

        public async Task<PostDto?> GetDtoByIdAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Where(p => p.post_id == id)
                .Select(p => new PostDto
                {
                    Id = p.post_id,
                    Title = p.title,
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
                .AsNoTracking()
                .Where(p => p.slug == slug && p.status)
                .Select(p => new PostDto
                {
                    Id = p.post_id,
                    Title = p.title,
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
                .AsNoTracking()
                .Where(p => p.status)
                .OrderByDescending(p => p.published_at)
                .Take(take)
                .ToListAsync();
        }

        public async Task<IEnumerable<PostListDto>> GetLatestDtosAsync(int page = 1, int pageSize = 20)
        {
            return await _dbSet
                .AsNoTracking()
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
                .AsNoTracking()
                .Where(p => p.status)
                .OrderByDescending(p => p.likes_count)
                .Take(take)
                .ToListAsync();
        }

        public async Task<IEnumerable<PostListDto>> GetTopDtosAsync(int take = 10)
        {
            return await _dbSet
                .AsNoTracking()
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
                .AsNoTracking()
                .Where(p => p.user_id == userId && p.status)
                .OrderByDescending(p => p.published_at)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IEnumerable<PostListDto>> GetByUserDtosAsync(int userId, int page = 1, int pageSize = 20)
        {
            return await _dbSet
                .AsNoTracking()
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
                .AsNoTracking()
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
                    .AsNoTracking()
                    .Where(p => p.status)
                    .OrderByDescending(p => p.published_at)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
            }

            var followingIds = await _context.UserFollows
                .AsNoTracking()
                .Where(uf => uf.follower_id == userId.Value)
                .Select(uf => uf.following_id)
                .ToListAsync();

            var query = _dbSet.AsNoTracking().Where(p => p.status && followingIds.Contains(p.user_id));

            var results = await query
                .AsNoTracking()
                .OrderByDescending(p => p.published_at)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (results.Count < pageSize)
            {
                var needed = pageSize - results.Count;
                var extras = await _dbSet
                    .AsNoTracking()
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
                return await GetLatestDtosAsync(page, pageSize);
            }

            //TEK SORGU: Following posts + fallback posts
            var query = _dbSet
                .AsNoTracking()
                .Where(p => p.status)
                .Select(p => new
                {
                    Post = p,
                    IsFollowing = _context.UserFollows
                        .Any(uf => uf.follower_id == userId.Value && uf.following_id == p.user_id)
                })
                .OrderByDescending(x => x.IsFollowing)  // Takip edilenler önce
                .ThenByDescending(x => x.Post.published_at)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new PostListDto
                {
                    Id = x.Post.post_id,
                    Slug = x.Post.slug,
                    Excerpt = x.Post.content_markdown.Substring(0,
                        x.Post.content_markdown.Length > 200 ? 200 : x.Post.content_markdown.Length),
                    Likes = x.Post.likes_count,
                    Views = x.Post.view_count,
                    Bookmarks = x.Post.bookmarks_count,
                    PublishedAt = x.Post.published_at,
                    AuthorDisplayName = x.Post.User.display_name,
                    Tags = x.Post.PostTags.Select(pt => pt.Tag.name).ToList()
                });

            return await query.ToListAsync();
        }

        //public async Task<IEnumerable<PostListDto>> GetRelevantDtosAsync(int? userId, int page = 1, int pageSize = 20)
        //{
        //    if (userId == null)
        //    {
        //        return await _dbSet
        //            .AsNoTracking()
        //            .Where(p => p.status)
        //            .OrderByDescending(p => p.published_at)
        //            .Skip((page - 1) * pageSize)
        //            .Take(pageSize)
        //            .Select(p => new PostListDto
        //            {
        //                Id = p.post_id,
        //                Slug = p.slug,
        //                Excerpt = p.content_markdown.Length > 200 ? p.content_markdown.Substring(0, 200) : p.content_markdown,
        //                Likes = p.likes_count,
        //                Views = p.view_count,
        //                Bookmarks = p.bookmarks_count,
        //                PublishedAt = p.published_at,
        //                AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
        //                Tags = p.PostTags.Select(pt => pt.Tag.name).ToList()
        //            })
        //            .ToListAsync();
        //    }

        //var followingIds = await _context.UserFollows
        //    .AsNoTracking()
        //    .Where(uf => uf.follower_id == userId.Value)
        //    .Select(uf => uf.following_id)
        //    .ToListAsync();

        //var results = await _dbSet
        //    .AsNoTracking()
        //    .Where(p => p.status && followingIds.Contains(p.user_id))
        //    .OrderByDescending(p => p.published_at)
        //    .Skip((page - 1) * pageSize)
        //    .Take(pageSize)
        //    .Select(p => new PostListDto
        //    {
        //        Id = p.post_id,
        //        Slug = p.slug,
        //        Excerpt = p.content_markdown.Length > 200 ? p.content_markdown.Substring(0, 200) : p.content_markdown,
        //        Likes = p.likes_count,
        //        Views = p.view_count,
        //        Bookmarks = p.bookmarks_count,
        //        PublishedAt = p.published_at,
        //        AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
        //        Tags = p.PostTags.Select(pt => pt.Tag.name).ToList()
        //    })
        //    .ToListAsync();

        //if (results.Count < pageSize)
        //{
        //    var needed = pageSize - results.Count;
        //    var extras = await _dbSet
        //        .AsNoTracking()
        //        .Where(p => p.status && !followingIds.Contains(p.user_id))
        //        .OrderByDescending(p => p.published_at)
        //        .Take(needed)
        //        .Select(p => new PostListDto
        //        {
        //            Id = p.post_id,
        //            Slug = p.slug,
        //            Excerpt = p.content_markdown.Length > 200 ? p.content_markdown.Substring(0, 200) : p.content_markdown,
        //            Likes = p.likes_count,
        //            Views = p.view_count,
        //            Bookmarks = p.bookmarks_count,
        //            PublishedAt = p.published_at,
        //            AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
        //            Tags = p.PostTags.Select(pt => pt.Tag.name).ToList()
        //        })
        //        .ToListAsync();

        //    results.AddRange(extras);
        //}

        //    return results;
        //}

        public async Task<IEnumerable<PostListDto>> SearchInDbAsync(string query, int? userId, int page = 1, int pageSize = 20)
        {
            // Boþ query kontrolü
            if (string.IsNullOrWhiteSpace(query))
            {
                return new List<PostListDto>();
            }

            // Query'yi normalize et (küçük harfe çevir, trim yap)
            var normalizedQuery = query.Trim().ToLower();

            var postsQuery = _dbSet
                .AsQueryable()
                .Where(p => p.status)
                .Where(p => p.slug.ToLower().Contains(normalizedQuery) ||
                            p.content_markdown.ToLower().Contains(normalizedQuery));

            // Eðer kullanýcý giriþ yaptýysa, takip ettiklerini öne çýkar
            if (userId.HasValue)
            {
                var followingIds = await _context.UserFollows
                    .Where(uf => uf.follower_id == userId.Value)
                    .Select(uf => uf.following_id)
                    .ToListAsync();

                // Takip edilenleri önce göster, sonra tarihe göre sýrala
                postsQuery = postsQuery
                    .AsNoTracking()
                    .OrderByDescending(p => followingIds.Contains(p.user_id))
                    .ThenByDescending(p => p.published_at);
            }
            else
            {
                // Giriþ yapmamýþsa sadece tarihe göre sýrala
                postsQuery = postsQuery.AsNoTracking().OrderByDescending(p => p.published_at); // AsNoTracking EKLENDI
            }

            return await postsQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PostListDto
                {
                    Id = p.post_id,
                    Slug = p.slug,
                    Excerpt = p.content_markdown.Length > 200
                        ? p.content_markdown.Substring(0, 200)
                        : p.content_markdown,
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


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
            // Draft post'lar� da d�nd�r (Service katman�nda yetki kontrol� yap�l�r)
            return await _dbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.post_id == id);
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
            var postDto = await _dbSet
                .AsNoTracking()
                .Where(p => p.post_id == id) // Status kontrolü yok - draft'ları da getir (Service'te kontrol edilecek)
                .Select(p => new PostDto
                {
                    Id = p.post_id,
                    Title = p.title ?? "",
                    Slug = p.slug,
                    ContentMarkdown = p.content_markdown,
                    CoverImageUrl = p.cover_img_url,
                    AuthorId = p.user_id,
                    AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                    Status = p.status, // ← Status'u DTO'ya ekle
                    PublishedAt = p.published_at,
                    CreatedAt = p.created_at,
                    UpdatedAt = p.updated_at,
                    LikesCount = p.likes_count,
                    CommentsCount = _context.Comments.Count(c => c.post_id == p.post_id),
                    ViewCount = p.view_count,
                    BookmarksCount = p.bookmarks_count,
                    ReadingTimeMinutes = p.reading_time_minutes,
                    Tags = p.PostTags.Where(pt => pt.Tag != null).Select(pt => pt.Tag!.name).ToList(),
                    ReactionTypes = new Dictionary<string, int>(), // Will be populated below
                    UserReactions = new List<string>(), // Will be populated in service layer
                    LikedByCurrentUser = false,
                    BookmarkedByCurrentUser = false
                })
                .FirstOrDefaultAsync();

            if (postDto != null)
            {
                postDto.ReactionTypes = await _context.Reactions
                    .Where(r => r.post_id == postDto.Id)
                    .GroupBy(r => r.reaction_type)
                    .Select(g => new { Type = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.Type, x => x.Count);
            }

            return postDto;
        }

        public async Task<PostDto?> GetDtoBySlugAsync(string slug)
        {
            var postDto = await _dbSet
                .AsNoTracking()
                .Where(p => p.slug == slug && p.status)
                .Select(p => new PostDto
                {
                    Id = p.post_id,
                    Title = p.title ?? "",
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
                    CommentsCount = _context.Comments.Count(c => c.post_id == p.post_id),
                    Tags = p.PostTags.Where(pt => pt.Tag != null).Select(pt => pt.Tag!.name).ToList(),
                    BookmarksCount = p.bookmarks_count,
                    ReadingTimeMinutes = p.reading_time_minutes,
                    ReactionTypes = new Dictionary<string, int>(), // Will be populated below
                    UserReactions = new List<string>(), // Will be populated in service layer
                    LikedByCurrentUser = false,
                    BookmarkedByCurrentUser = false
                })
                .FirstOrDefaultAsync();

            if (postDto != null)
            {
                postDto.ReactionTypes = await _context.Reactions
                    .Where(r => r.post_id == postDto.Id)
                    .GroupBy(r => r.reaction_type)
                    .Select(g => new { Type = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.Type, x => x.Count);
            }

            return postDto;
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
            var posts = await _dbSet
                .AsNoTracking()
                .Include(p => p.Reactions)
                .Include(p => p.User)
                .Include(p => p.PostTags)
                    .ThenInclude(pt => pt.Tag)
                .Where(p => p.status)
                .OrderByDescending(p => p.published_at)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var postDtos = posts.Select(p => new PostListDto
            {
                Id = p.post_id,
                Title = p.title ?? "",
                Slug = p.slug,
                Excerpt = p.content_markdown.Length > 200 ? p.content_markdown.Substring(0, 200) : p.content_markdown,
                Likes = p.likes_count,
                Views = p.view_count,
                Bookmarks = p.bookmarks_count,
                CoverImageUrl = p.cover_img_url,
                ReadingTimeMinutes = p.reading_time_minutes,
                CommentsCount = p.comments_count,
                PublishedAt = p.published_at,
                AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                Tags = p.PostTags.Where(pt => pt.Tag != null).Select(pt => pt.Tag!.name).ToList(),
                ReactionTypes = p.Reactions.GroupBy(r => r.reaction_type).ToDictionary(g => g.Key, g => g.Count())
            }).ToList();
            return postDtos;
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
            var posts = await _dbSet
                .AsNoTracking()
                .Include(p => p.Reactions)
                .Include(p => p.User)
                .Include(p => p.PostTags)
                    .ThenInclude(pt => pt.Tag)
                .Where(p => p.status)
                .OrderByDescending(p => p.likes_count)
                .Take(take)
                .ToListAsync();

            var postDtos = posts.Select(p => new PostListDto
            {
                Id = p.post_id,
                Title = p.title ?? "",
                Slug = p.slug,
                Excerpt = p.content_markdown.Length > 200 ? p.content_markdown.Substring(0, 200) : p.content_markdown,
                Likes = p.likes_count,
                Views = p.view_count,
                Bookmarks = p.bookmarks_count,
                CoverImageUrl = p.cover_img_url,
                ReadingTimeMinutes = p.reading_time_minutes,
                CommentsCount = p.comments_count,
                PublishedAt = p.published_at,
                AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                Tags = p.PostTags.Where(pt => pt.Tag != null).Select(pt => pt.Tag!.name).ToList(),
                ReactionTypes = p.Reactions.GroupBy(r => r.reaction_type).ToDictionary(g => g.Key, g => g.Count())
            }).ToList();
            return postDtos;
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
                    Title = p.title ?? "",
                    Slug = p.slug,
                    Excerpt = p.content_markdown.Length > 200 ? p.content_markdown.Substring(0, 200) : p.content_markdown,
                    Likes = p.likes_count,
                    Views = p.view_count,
                    Bookmarks = p.bookmarks_count,
                    CoverImageUrl = p.cover_img_url,
                    ReadingTimeMinutes = p.reading_time_minutes,
                    CommentsCount = p.comments_count,
                    PublishedAt = p.published_at,
                    AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                    Tags = p.PostTags.Where(pt => pt.Tag != null).Select(pt => pt.Tag!.name).ToList(),
                    ReactionTypes = new Dictionary<string, int>() // Will be populated in service layer if needed
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
                .Where(pt => pt.Tag != null && pt.Post != null && pt.Tag.name == tagSlug && pt.Post.status)
                .OrderByDescending(pt => pt.Post!.published_at)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(pt => new PostListDto
                {
                    Id = pt.Post!.post_id,
                    Title = pt.Post.title ?? "",
                    Slug = pt.Post.slug,
                    Excerpt = pt.Post.content_markdown.Length > 200 ? pt.Post.content_markdown.Substring(0, 200) : pt.Post.content_markdown,
                    Likes = pt.Post.likes_count,
                    Views = pt.Post.view_count,
                    Bookmarks = pt.Post.bookmarks_count,
                    CoverImageUrl = pt.Post.cover_img_url,
                    ReadingTimeMinutes = pt.Post.reading_time_minutes,
                    CommentsCount = pt.Post.comments_count,
                    PublishedAt = pt.Post.published_at,
                    AuthorDisplayName = pt.Post.User != null ? pt.Post.User.display_name : string.Empty,
                    Tags = pt.Post.PostTags.Where(pt2 => pt2.Tag != null).Select(pt2 => pt2.Tag!.name).ToList(),
                    ReactionTypes = new Dictionary<string, int>() // Will be filled in service layer
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

            var posts = await _dbSet
                .AsNoTracking()
                .Include(p => p.Reactions)
                .Include(p => p.User)
                .Include(p => p.PostTags)
                    .ThenInclude(pt => pt.Tag)
                .Where(p => p.status)
                .OrderByDescending(p => p.published_at)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var postDtos = posts.Select(p => new PostListDto
            {
                Id = p.post_id,
                Title = p.title ?? "",
                Slug = p.slug,
                Excerpt = p.content_markdown.Length > 200 ? p.content_markdown.Substring(0, 200) : p.content_markdown,
                Likes = p.likes_count,
                Views = p.view_count,
                Bookmarks = p.bookmarks_count,
                CoverImageUrl = p.cover_img_url,
                ReadingTimeMinutes = p.reading_time_minutes,
                CommentsCount = p.comments_count,
                PublishedAt = p.published_at,
                AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                Tags = p.PostTags.Where(pt => pt.Tag != null).Select(pt => pt.Tag!.name).ToList(),
                ReactionTypes = p.Reactions.GroupBy(r => r.reaction_type).ToDictionary(g => g.Key, g => g.Count())
            }).ToList();
            return postDtos;
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
            if (string.IsNullOrWhiteSpace(query))
            {
                return new List<PostListDto>();
            }

            // Query'yi normalize et (k���k harfe �evir, trim yap)
            var normalizedQuery = query.Trim().ToLower();

            var postsQuery = _dbSet
                .AsQueryable()
                .Where(p => p.status)
                // NOTE: For performance reasons, search only in slug and title for now
                .Where(p => p.slug.ToLower().Contains(normalizedQuery)
                            || (p.title != null && p.title.ToLower().Contains(normalizedQuery)));

            // E�er kullan�c� giri� yapt�ysa, takip ettiklerini �ne ��kar
            if (userId.HasValue)
            {
                var followingIds = await _context.UserFollows
                    .Where(uf => uf.follower_id == userId.Value)
                    .Select(uf => uf.following_id)
                    .ToListAsync();

                // Takip edilenleri �nce g�ster, sonra tarihe g�re s�rala
                postsQuery = postsQuery
                    .AsNoTracking()
                    .OrderByDescending(p => followingIds.Contains(p.user_id))
                    .ThenByDescending(p => p.published_at);
            }
            else
            {
                // Giri� yapmam��sa sadece tarihe g�re s�rala
                postsQuery = postsQuery.AsNoTracking().OrderByDescending(p => p.published_at); // AsNoTracking EKLENDI
            }

            return await postsQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PostListDto
                {
                    Id = p.post_id,
                    Title = p.title ?? "",
                    Slug = p.slug,
                    Excerpt = p.content_markdown.Length > 200
                        ? p.content_markdown.Substring(0, 200)
                        : p.content_markdown,
                    Likes = p.likes_count,
                    Views = p.view_count,
                    Bookmarks = p.bookmarks_count,
                    CoverImageUrl = p.cover_img_url,
                    ReadingTimeMinutes = p.reading_time_minutes,
                    CommentsCount = p.comments_count,
                    PublishedAt = p.published_at,
                    AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                    Tags = p.PostTags.Where(pt => pt.Tag != null).Select(pt => pt.Tag!.name).ToList(),
                    ReactionTypes = new Dictionary<string, int>() // Will be populated in service layer if needed
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<PostListDto>> GetUserDraftDtosAsync(int userId, int page = 1, int pageSize = 20)
        {
            return await _dbSet
                .AsNoTracking()
                .Where(p => p.user_id == userId && !p.status)
                .OrderByDescending(p => p.updated_at)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PostListDto
                {
                    Id = p.post_id,
                    Title = p.title ?? "",
                    Slug = p.slug,
                    Excerpt = p.content_markdown.Length > 200 ? p.content_markdown.Substring(0, 200) : p.content_markdown,
                    Likes = p.likes_count,
                    Views = p.view_count,
                    Bookmarks = p.bookmarks_count,
                    CoverImageUrl = p.cover_img_url,
                    ReadingTimeMinutes = p.reading_time_minutes,
                    CommentsCount = p.comments_count,
                    PublishedAt = p.published_at,
                    AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                    Tags = p.PostTags.Where(pt => pt.Tag != null).Select(pt => pt.Tag!.name).ToList(),
                    ReactionTypes = new Dictionary<string, int>() // Will be populated in service layer if needed
                })
                .ToListAsync();
        }


    }
}


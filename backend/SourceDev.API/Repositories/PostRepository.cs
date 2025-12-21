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
            return await _dbSet.AsNoTracking()
                .Include(p => p.Translations)
                .FirstOrDefaultAsync(p => p.Translations.Any(t => t.slug == slug) && p.status);
        }

        public async Task<PostDto?> GetDtoByIdAsync(int id)
        {
            var post = await _dbSet
                .AsNoTracking()
                .Include(p => p.User)
                .Include(p => p.Translations)
                .Include(p => p.PostTags).ThenInclude(pt => pt.Tag)
                .FirstOrDefaultAsync(p => p.post_id == id);

            if (post == null) return null;

            var defaultTranslation = post.Translations.FirstOrDefault(t => t.language_code == post.default_language_code) 
                                     ?? post.Translations.FirstOrDefault();

            var postDto = new PostDto
            {
                Id = post.post_id,
                Title = defaultTranslation?.title ?? "",
                Slug = defaultTranslation?.slug ?? "",
                ContentMarkdown = defaultTranslation?.content_markdown ?? "",
                CoverImageUrl = post.cover_img_url,
                AuthorId = post.user_id,
                AuthorDisplayName = post.User?.display_name ?? string.Empty,
                Status = post.status,
                PublishedAt = post.published_at,
                CreatedAt = post.created_at,
                UpdatedAt = post.updated_at,
                LikesCount = post.likes_count,
                CommentsCount = post.comments_count,
                ViewCount = post.view_count,
                BookmarksCount = post.bookmarks_count,
                ReadingTimeMinutes = post.reading_time_minutes,
                Tags = post.PostTags.Select(pt => pt.Tag.name).ToList(),
                Translations = post.Translations.Select(t => new PostTranslationDto
                {
                    LanguageCode = t.language_code,
                    Title = t.title,
                    Slug = t.slug,
                    ContentMarkdown = t.content_markdown
                }).ToList(),
                ReactionTypes = new Dictionary<string, int>(),
                UserReactions = new List<string>(),
                LikedByCurrentUser = false,
                BookmarkedByCurrentUser = false
            };

            postDto.ReactionTypes = await _context.Reactions
                .Where(r => r.post_id == postDto.Id)
                .GroupBy(r => r.reaction_type)
                .Select(g => new { Type = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Type, x => x.Count);

            return postDto;
        }

        public async Task<PostDto?> GetDtoBySlugAsync(string slug)
        {
            var post = await _dbSet
                .AsNoTracking()
                .Include(p => p.User)
                .Include(p => p.Translations)
                .Include(p => p.PostTags).ThenInclude(pt => pt.Tag)
                .FirstOrDefaultAsync(p => p.Translations.Any(t => t.slug == slug) && p.status);

            if (post == null) return null;

            var matchedTranslation = post.Translations.FirstOrDefault(t => t.slug == slug);

            var postDto = new PostDto
            {
                Id = post.post_id,
                Title = matchedTranslation?.title ?? "",
                Slug = matchedTranslation?.slug ?? "",
                ContentMarkdown = matchedTranslation?.content_markdown ?? "",
                CoverImageUrl = post.cover_img_url,
                AuthorId = post.user_id,
                AuthorDisplayName = post.User != null ? post.User.display_name : string.Empty,
                Status = post.status,
                PublishedAt = post.published_at,
                CreatedAt = post.created_at,
                UpdatedAt = post.updated_at,
                LikesCount = post.likes_count,
                ViewCount = post.view_count,
                CommentsCount = _context.Comments.Count(c => c.post_id == post.post_id),
                Tags = post.PostTags.Where(pt => pt.Tag != null).Select(pt => pt.Tag!.name).ToList(),
                BookmarksCount = post.bookmarks_count,
                ReadingTimeMinutes = post.reading_time_minutes,
                Translations = post.Translations.Select(t => new PostTranslationDto
                {
                    LanguageCode = t.language_code,
                    Title = t.title,
                    Slug = t.slug,
                    ContentMarkdown = t.content_markdown
                }).ToList(),
                ReactionTypes = new Dictionary<string, int>(),
                UserReactions = new List<string>(),
                LikedByCurrentUser = false,
                BookmarkedByCurrentUser = false
            };

            postDto.ReactionTypes = await _context.Reactions
                .Where(r => r.post_id == postDto.Id)
                .GroupBy(r => r.reaction_type)
                .Select(g => new { Type = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Type, x => x.Count);

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
            // 1. Fetch Posts
            var posts = await _dbSet
                .AsNoTracking()
                .Where(p => p.status)
                .OrderByDescending(p => p.published_at)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PostListDto
                {
                    Id = p.post_id,
                    Title = p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).title ?? p.Translations.FirstOrDefault().title ?? "",
                    Slug = p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).slug ?? p.Translations.FirstOrDefault().slug ?? "",
                    Excerpt = (p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).content_markdown ?? p.Translations.FirstOrDefault().content_markdown ?? "").Length > 200 
                        ? (p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).content_markdown ?? p.Translations.FirstOrDefault().content_markdown ?? "").Substring(0, 200) 
                        : (p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).content_markdown ?? p.Translations.FirstOrDefault().content_markdown ?? ""),
                    Likes = p.likes_count,
                    Views = p.view_count,
                    Bookmarks = p.bookmarks_count,
                    CoverImageUrl = p.cover_img_url,
                    ReadingTimeMinutes = p.reading_time_minutes,
                    CommentsCount = p.comments_count,
                    PublishedAt = p.published_at,
                    AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                    Tags = p.PostTags.Where(pt => pt.Tag != null).Select(pt => pt.Tag!.name).ToList(),
                    ReactionTypes = new Dictionary<string, int>() // Placeholder
                })
                .ToListAsync();

            // 2. Fetch Reaction Counts for these posts
            if (posts.Any())
            {
                var postIds = posts.Select(p => p.Id).ToList();
                var reactions = await _context.Reactions
                    .AsNoTracking()
                    .Where(r => postIds.Contains(r.post_id))
                    .GroupBy(r => new { r.post_id, r.reaction_type })
                    .Select(g => new { PostId = g.Key.post_id, Type = g.Key.reaction_type, Count = g.Count() })
                    .ToListAsync();

                // 3. Map reactions to posts
                foreach (var post in posts)
                {
                    var postReactions = reactions.Where(r => r.PostId == post.Id);
                    foreach (var pr in postReactions)
                    {
                        post.ReactionTypes[pr.Type] = pr.Count;
                    }
                }
            }

            return posts;
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
            // 1. Fetch Posts
            var posts = await _dbSet
                .AsNoTracking()
                .Where(p => p.status)
                .OrderByDescending(p => p.likes_count)
                .Take(take)
                .Select(p => new PostListDto
                {
                    Id = p.post_id,
                    Title = p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).title ?? p.Translations.FirstOrDefault().title ?? "",
                    Slug = p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).slug ?? p.Translations.FirstOrDefault().slug ?? "",
                    Excerpt = (p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).content_markdown ?? p.Translations.FirstOrDefault().content_markdown ?? "").Length > 200 
                        ? (p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).content_markdown ?? p.Translations.FirstOrDefault().content_markdown ?? "").Substring(0, 200) 
                        : (p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).content_markdown ?? p.Translations.FirstOrDefault().content_markdown ?? ""),
                    Likes = p.likes_count,
                    Views = p.view_count,
                    Bookmarks = p.bookmarks_count,
                    CoverImageUrl = p.cover_img_url,
                    ReadingTimeMinutes = p.reading_time_minutes,
                    CommentsCount = p.comments_count,
                    PublishedAt = p.published_at,
                    AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                    Tags = p.PostTags.Where(pt => pt.Tag != null).Select(pt => pt.Tag!.name).ToList(),
                    ReactionTypes = new Dictionary<string, int>() // Placeholder
                })
                .ToListAsync();

            // 2. Fetch Reaction Counts
            if (posts.Any())
            {
                var postIds = posts.Select(p => p.Id).ToList();
                var reactions = await _context.Reactions
                    .AsNoTracking()
                    .Where(r => postIds.Contains(r.post_id))
                    .GroupBy(r => new { r.post_id, r.reaction_type })
                    .Select(g => new { PostId = g.Key.post_id, Type = g.Key.reaction_type, Count = g.Count() })
                    .ToListAsync();

                // 3. Map reactions
                foreach (var post in posts)
                {
                    var postReactions = reactions.Where(r => r.PostId == post.Id);
                    foreach (var pr in postReactions)
                    {
                        post.ReactionTypes[pr.Type] = pr.Count;
                    }
                }
            }

            return posts;
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
            var posts = await _dbSet
                .AsNoTracking()
                .Where(p => p.user_id == userId && p.status)
                .OrderByDescending(p => p.published_at)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PostListDto
                {
                    Id = p.post_id,
                    Title = p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).title ?? p.Translations.FirstOrDefault().title ?? "",
                    Slug = p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).slug ?? p.Translations.FirstOrDefault().slug ?? "",
                    Excerpt = (p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).content_markdown ?? p.Translations.FirstOrDefault().content_markdown ?? "").Length > 200 
                        ? (p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).content_markdown ?? p.Translations.FirstOrDefault().content_markdown ?? "").Substring(0, 200) 
                        : (p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).content_markdown ?? p.Translations.FirstOrDefault().content_markdown ?? ""),
                    Likes = p.likes_count,
                    Views = p.view_count,
                    Bookmarks = p.bookmarks_count,
                    CoverImageUrl = p.cover_img_url,
                    ReadingTimeMinutes = p.reading_time_minutes,
                    CommentsCount = p.comments_count,
                    PublishedAt = p.published_at,
                    AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                    Tags = p.PostTags.Where(pt => pt.Tag != null).Select(pt => pt.Tag!.name).ToList(),
                    ReactionTypes = new Dictionary<string, int>()
                })
                .ToListAsync();

            if (posts.Any())
            {
                var postIds = posts.Select(p => p.Id).ToList();
                var reactions = await _context.Reactions
                    .AsNoTracking()
                    .Where(r => postIds.Contains(r.post_id))
                    .GroupBy(r => new { r.post_id, r.reaction_type })
                    .Select(g => new { PostId = g.Key.post_id, Type = g.Key.reaction_type, Count = g.Count() })
                    .ToListAsync();

                foreach (var post in posts)
                {
                    var postReactions = reactions.Where(r => r.PostId == post.Id);
                    foreach (var pr in postReactions)
                    {
                        post.ReactionTypes[pr.Type] = pr.Count;
                    }
                }
            }

            return posts;
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
            var posts = await _context.PostTags
                .AsNoTracking()
                .Where(pt => pt.Tag != null && pt.Post != null && pt.Tag.name == tagSlug && pt.Post.status)
                .OrderByDescending(pt => pt.Post!.published_at)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(pt => new PostListDto
                {
                    Id = pt.Post!.post_id,
                    Title = pt.Post.Translations.FirstOrDefault(t => t.language_code == pt.Post.default_language_code).title ?? pt.Post.Translations.FirstOrDefault().title ?? "",
                    Slug = pt.Post.Translations.FirstOrDefault(t => t.language_code == pt.Post.default_language_code).slug ?? pt.Post.Translations.FirstOrDefault().slug ?? "",
                    Excerpt = (pt.Post.Translations.FirstOrDefault(t => t.language_code == pt.Post.default_language_code).content_markdown ?? pt.Post.Translations.FirstOrDefault().content_markdown ?? "").Length > 200 
                        ? (pt.Post.Translations.FirstOrDefault(t => t.language_code == pt.Post.default_language_code).content_markdown ?? pt.Post.Translations.FirstOrDefault().content_markdown ?? "").Substring(0, 200) 
                        : (pt.Post.Translations.FirstOrDefault(t => t.language_code == pt.Post.default_language_code).content_markdown ?? pt.Post.Translations.FirstOrDefault().content_markdown ?? ""),
                    Likes = pt.Post.likes_count,
                    Views = pt.Post.view_count,
                    Bookmarks = pt.Post.bookmarks_count,
                    CoverImageUrl = pt.Post.cover_img_url,
                    ReadingTimeMinutes = pt.Post.reading_time_minutes,
                    CommentsCount = pt.Post.comments_count,
                    PublishedAt = pt.Post.published_at,
                    AuthorDisplayName = pt.Post.User != null ? pt.Post.User.display_name : string.Empty,
                    Tags = pt.Post.PostTags.Where(pt2 => pt2.Tag != null).Select(pt2 => pt2.Tag!.name).ToList(),
                    ReactionTypes = new Dictionary<string, int>()
                })
                .ToListAsync();

            if (posts.Any())
            {
                var postIds = posts.Select(p => p.Id).ToList();
                var reactions = await _context.Reactions
                    .AsNoTracking()
                    .Where(r => postIds.Contains(r.post_id))
                    .GroupBy(r => new { r.post_id, r.reaction_type })
                    .Select(g => new { PostId = g.Key.post_id, Type = g.Key.reaction_type, Count = g.Count() })
                    .ToListAsync();

                foreach (var post in posts)
                {
                    var postReactions = reactions.Where(r => r.PostId == post.Id);
                    foreach (var pr in postReactions)
                    {
                        post.ReactionTypes[pr.Type] = pr.Count;
                    }
                }
            }

            return posts;
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

            // 1. Get IDs of users followed by the current user
            var followingIds = await _context.UserFollows
                .AsNoTracking()
                .Where(uf => uf.follower_id == userId.Value)
                .Select(uf => uf.following_id)
                .ToListAsync();

            // 2. Fetch posts from followed users
            var posts = await _dbSet
                .AsNoTracking()
                .Where(p => p.status && followingIds.Contains(p.user_id))
                .OrderByDescending(p => p.published_at)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PostListDto
                {
                    Id = p.post_id,
                    Title = p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).title ?? p.Translations.FirstOrDefault().title ?? "",
                    Slug = p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).slug ?? p.Translations.FirstOrDefault().slug ?? "",
                    Excerpt = (p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).content_markdown ?? p.Translations.FirstOrDefault().content_markdown ?? "").Length > 200 
                        ? (p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).content_markdown ?? p.Translations.FirstOrDefault().content_markdown ?? "").Substring(0, 200) 
                        : (p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).content_markdown ?? p.Translations.FirstOrDefault().content_markdown ?? ""),
                    Likes = p.likes_count,
                    Views = p.view_count,
                    Bookmarks = p.bookmarks_count,
                    CoverImageUrl = p.cover_img_url,
                    ReadingTimeMinutes = p.reading_time_minutes,
                    CommentsCount = p.comments_count,
                    PublishedAt = p.published_at,
                    AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                    Tags = p.PostTags.Where(pt => pt.Tag != null).Select(pt => pt.Tag!.name).ToList(),
                    ReactionTypes = new Dictionary<string, int>() // Placeholder
                })
                .ToListAsync();

            // 3. If not enough posts, fill with latest posts from others
            if (posts.Count < pageSize)
            {
                var needed = pageSize - posts.Count;
                var extraPosts = await _dbSet
                    .AsNoTracking()
                    .Where(p => p.status && !followingIds.Contains(p.user_id))
                    .OrderByDescending(p => p.published_at)
                    .Take(needed)
                    .Select(p => new PostListDto
                    {
                        Id = p.post_id,
                        Title = p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).title ?? p.Translations.FirstOrDefault().title ?? "",
                        Slug = p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).slug ?? p.Translations.FirstOrDefault().slug ?? "",
                        Excerpt = (p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).content_markdown ?? p.Translations.FirstOrDefault().content_markdown ?? "").Length > 200 
                            ? (p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).content_markdown ?? p.Translations.FirstOrDefault().content_markdown ?? "").Substring(0, 200) 
                            : (p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).content_markdown ?? p.Translations.FirstOrDefault().content_markdown ?? ""),
                        Likes = p.likes_count,
                        Views = p.view_count,
                        Bookmarks = p.bookmarks_count,
                        CoverImageUrl = p.cover_img_url,
                        ReadingTimeMinutes = p.reading_time_minutes,
                        CommentsCount = p.comments_count,
                        PublishedAt = p.published_at,
                        AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                        Tags = p.PostTags.Where(pt => pt.Tag != null).Select(pt => pt.Tag!.name).ToList(),
                        ReactionTypes = new Dictionary<string, int>() // Placeholder
                    })
                    .ToListAsync();

                posts.AddRange(extraPosts);
            }

            // 4. Fetch Reaction Counts for ALL collected posts
            if (posts.Any())
            {
                var postIds = posts.Select(p => p.Id).ToList();
                var reactions = await _context.Reactions
                    .AsNoTracking()
                    .Where(r => postIds.Contains(r.post_id))
                    .GroupBy(r => new { r.post_id, r.reaction_type })
                    .Select(g => new { PostId = g.Key.post_id, Type = g.Key.reaction_type, Count = g.Count() })
                    .ToListAsync();

                foreach (var post in posts)
                {
                    var postReactions = reactions.Where(r => r.PostId == post.Id);
                    foreach (var pr in postReactions)
                    {
                        post.ReactionTypes[pr.Type] = pr.Count;
                    }
                }
            }

            return posts;
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
                .Where(p => p.Translations.Any(t => t.slug.ToLower().Contains(normalizedQuery) || t.title.ToLower().Contains(normalizedQuery)));

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

            var posts = await postsQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PostListDto
                {
                    Id = p.post_id,
                    Title = p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).title ?? p.Translations.FirstOrDefault().title ?? "",
                    Slug = p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).slug ?? p.Translations.FirstOrDefault().slug ?? "",
                    Excerpt = (p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).content_markdown ?? p.Translations.FirstOrDefault().content_markdown ?? "").Length > 200 
                        ? (p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).content_markdown ?? p.Translations.FirstOrDefault().content_markdown ?? "").Substring(0, 200) 
                        : (p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).content_markdown ?? p.Translations.FirstOrDefault().content_markdown ?? ""),
                    Likes = p.likes_count,
                    Views = p.view_count,
                    Bookmarks = p.bookmarks_count,
                    CoverImageUrl = p.cover_img_url,
                    ReadingTimeMinutes = p.reading_time_minutes,
                    CommentsCount = p.comments_count,
                    PublishedAt = p.published_at,
                    AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                    Tags = p.PostTags.Where(pt => pt.Tag != null).Select(pt => pt.Tag!.name).ToList(),
                    ReactionTypes = new Dictionary<string, int>()
                })
                .ToListAsync();

            if (posts.Any())
            {
                var postIds = posts.Select(p => p.Id).ToList();
                var reactions = await _context.Reactions
                    .AsNoTracking()
                    .Where(r => postIds.Contains(r.post_id))
                    .GroupBy(r => new { r.post_id, r.reaction_type })
                    .Select(g => new { PostId = g.Key.post_id, Type = g.Key.reaction_type, Count = g.Count() })
                    .ToListAsync();

                foreach (var post in posts)
                {
                    var postReactions = reactions.Where(r => r.PostId == post.Id);
                    foreach (var pr in postReactions)
                    {
                        post.ReactionTypes[pr.Type] = pr.Count;
                    }
                }
            }

            return posts;
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
                    Title = p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).title ?? p.Translations.FirstOrDefault().title ?? "",
                    Slug = p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).slug ?? p.Translations.FirstOrDefault().slug ?? "",
                    Excerpt = (p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).content_markdown ?? p.Translations.FirstOrDefault().content_markdown ?? "").Length > 200 
                        ? (p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).content_markdown ?? p.Translations.FirstOrDefault().content_markdown ?? "").Substring(0, 200) 
                        : (p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code).content_markdown ?? p.Translations.FirstOrDefault().content_markdown ?? ""),
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


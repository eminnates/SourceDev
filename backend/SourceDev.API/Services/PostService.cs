using SourceDev.API.DTOs.Post;
using SourceDev.API.Models.Entities;
using SourceDev.API.Repositories;
using SourceDev.API.Models;
using Microsoft.EntityFrameworkCore;
using SourceDev.API.Services.Background;

namespace SourceDev.API.Services
{
    public class PostService : IPostService //VALIDATORLAR EKLENECEK
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<PostService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IViewCountQueue _viewCountQueue;

        public PostService(IUnitOfWork unitOfWork, ILogger<PostService> logger, IServiceScopeFactory scopeFactory, IHttpContextAccessor httpContextAccessor, IViewCountQueue viewCountQueue)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _scopeFactory = scopeFactory;
            _httpContextAccessor = httpContextAccessor;
            _viewCountQueue = viewCountQueue;
        }

        public async Task<PostDto> CreateAsync(CreatePostDto dto, int authorId)
        {
            if (dto.Translations == null || !dto.Translations.Any())
            {
                throw new ArgumentException("At least one translation is required", nameof(dto.Translations));
            }

            if (!dto.Translations.Any(t => t.LanguageCode == dto.DefaultLanguageCode))
            {
                 throw new ArgumentException("Default language translation is missing", nameof(dto.DefaultLanguageCode));
            }

            var post = new Post
            {
                user_id = authorId,
                default_language_code = dto.DefaultLanguageCode,
                cover_img_url = dto.CoverImageUrl,
                status = dto.PublishNow,
                published_at = dto.PublishNow ? DateTime.UtcNow : null,
                created_at = DateTime.UtcNow,
                updated_at = DateTime.UtcNow,
                likes_count = 0,
                bookmarks_count = 0,
                view_count = 0,
                reading_time_minutes = 0
            };

            long maxReadingTime = 0;

            foreach (var transDto in dto.Translations)
            {
                if (string.IsNullOrWhiteSpace(transDto.Title)) continue;

                var slug = GenerateSlug(transDto.Title);
                var existingPost = await _unitOfWork.Posts.GetBySlugAsync(slug);
                
                if (existingPost != null)
                {
                    var counter = 1;
                    var originalSlug = slug;
                    while (existingPost != null)
                    {
                        slug = $"{originalSlug}-{counter}";
                        existingPost = await _unitOfWork.Posts.GetBySlugAsync(slug);
                        counter++;
                    }
                }

                var readingTime = CalculateReadingTimeMinutes(transDto.Content);
                if (readingTime > maxReadingTime) maxReadingTime = readingTime;

                post.Translations.Add(new PostTranslation
                {
                    language_code = transDto.LanguageCode,
                    title = transDto.Title,
                    content_markdown = transDto.Content,
                    slug = slug
                });
            }
            
            post.reading_time_minutes = maxReadingTime;

            await _unitOfWork.Posts.AddAsync(post);
            await _unitOfWork.SaveChangesAsync();

            // Add tags by name if provided
            if (dto.Tags != null && dto.Tags.Any())
            {
                await AddTagsToPostBatchAsync(post.post_id, dto.Tags);
            }

            // Add tags by ID if provided
            if (dto.TagIds != null && dto.TagIds.Any())
            {
                foreach (var tagId in dto.TagIds)
                {
                    await AddTagToPostByIdInternalAsync(post.post_id, tagId);
                }
            }

            var createdPostDto = await _unitOfWork.Posts.GetDtoByIdAsync(post.post_id);
            if (createdPostDto == null)
            {
                throw new InvalidOperationException("Failed to retrieve created post");
            }
            _logger.LogInformation("Post created successfully. PostId: {PostId}", post.post_id);

            return createdPostDto;
        }

        public async Task<bool> DeleteAsync(int id, int requesterId)
        {
            var post = await _unitOfWork.Posts.GetByIdAsync(id);

            if (post == null) return false;

            // Zaten silinmiş mi kontrol et
            if (post.deleted_at.HasValue)
            {
                _logger.LogWarning("Post already deleted. PostId: {PostId}", id);
                return false;
            }

            // Yetki kontrolü
            if (post.user_id != requesterId)
            {
                throw new Exception("You can only delete your own posts");
            }

            // Soft delete
            post.deleted_at = DateTime.UtcNow;
            post.updated_at = DateTime.UtcNow;
            post.status = false;  // İkisi de set edilebilir

            _unitOfWork.Posts.Update(post);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Post soft deleted. PostId: {PostId}, DeletedBy: {UserId}", id, requesterId);

            return true;
        }

        public async Task<PostDto?> GetByIdAsync(int id, int? currentUserId = null)
        {
            var postDto = await _unitOfWork.Posts.GetDtoByIdAsync(id);

            if (postDto == null)
            {
                _logger.LogWarning("Post not found. PostId: {PostId}", id);
                return null;
            }

            // Draft kontrolü - sadece sahibi görebilir
            if (!postDto.Status && postDto.AuthorId != currentUserId)
            {
                _logger.LogWarning("Draft post access denied. PostId: {PostId}, UserId: {UserId}", id, currentUserId);
                return null;
            }

            // Kullanıcıya özel alanlar
            if (currentUserId.HasValue)
            {
                // Kullanıcının reaction'larını getir
                postDto.UserReactions = (await _unitOfWork.Reactions
                    .FindAsync(r => r.post_id == id && r.user_id == currentUserId.Value))
                    .Select(r => r.reaction_type)
                    .ToList();

                // LikedByCurrentUser - "like" reaction'ı var mı?
                postDto.LikedByCurrentUser = postDto.UserReactions.Contains("like");

                postDto.BookmarkedByCurrentUser = await _unitOfWork.Bookmarks
                    .AnyAsync(b => b.post_id == id && b.user_id == currentUserId.Value);
            }

            // View count artır (fire-and-forget - performans için asenkron)
            _ = _viewCountQueue.QueueViewCountAsync(id);

            _logger.LogInformation("Post retrieved. PostId: {PostId}, UserId: {UserId}", id, currentUserId);

            return postDto;
        }

        public async Task<PostDto?> GetForEditAsync(int id, int requesterId)
        {
            var postDto = await _unitOfWork.Posts.GetDtoByIdAsync(id);

            if (postDto == null) return null;

            if (postDto.AuthorId != requesterId)
            {
                throw new UnauthorizedAccessException("You are not the author of this post.");
            }

            return postDto;
        }


        public async Task<PostDto?> GetBySlugAsync(string slug, int? currentUserId = null)
        {
            var postDto = await _unitOfWork.Posts.GetDtoBySlugAsync(slug);
            if (postDto == null)
            {
                _logger.LogWarning("Post not found. PostSlug: {PostSlug}", slug);
                return null;
            }
            if (currentUserId.HasValue)
            {
                // Kullanıcının reaction'larını getir
                postDto.UserReactions = (await _unitOfWork.Reactions
                    .FindAsync(r => r.post_id == postDto.Id && r.user_id == currentUserId.Value))
                    .Select(r => r.reaction_type)
                    .ToList();

                // LikedByCurrentUser - "like" reaction'ı var mı?
                postDto.LikedByCurrentUser = postDto.UserReactions.Contains("like");

                postDto.BookmarkedByCurrentUser = await _unitOfWork.Bookmarks
                    .AnyAsync(b => b.post_id == postDto.Id && b.user_id == currentUserId.Value);
            }

            _ = _viewCountQueue.QueueViewCountAsync(postDto.Id);

            _logger.LogInformation("Post retrieved. Slug: {Slug}, PostId: {PostId}, UserId: {UserId}", slug, postDto.Id, currentUserId);

            return postDto;
        }

        public async Task<IEnumerable<PostListDto>> GetByTagAsync(string tagSlug, int page, int pageSize)
        {
            var result = (await _unitOfWork.Posts.GetByTagDtosAsync(tagSlug, page, pageSize)).ToList();
            var currentUserId = GetCurrentUserId();

            await PopulateReactionsAndBookmarksAsync(result, currentUserId);

            _logger.LogInformation("Posts by tag fetched. Tag: {Tag}, Page: {Page}, Size: {Size}", tagSlug, page, pageSize);
            return result;
        }

        public async Task<IEnumerable<PostListDto>> GetByUserAsync(int userId, int page, int pageSize)
        {
            var result = (await _unitOfWork.Posts.GetByUserDtosAsync(userId, page, pageSize)).ToList();

            // Populate reaction counts and current user's reactions/bookmarks
            var currentUserId = GetCurrentUserId();
            await PopulateReactionsAndBookmarksAsync(result, currentUserId);

            _logger.LogInformation("Posts by user fetched. UserId: {UserId}, Page: {Page}, Size: {Size}", userId, page, pageSize);
            return result;
        }

        public async Task<IEnumerable<PostListDto>> GetUserDraftsAsync(int userId, int page, int pageSize)
        {
            var result = await _unitOfWork.Posts.GetUserDraftDtosAsync(userId, page, pageSize);
            _logger.LogInformation("Draft posts fetched. UserId: {UserId}, Page: {Page}, Size: {Size}", userId, page, pageSize);
            return result;
        }

        public async Task<IEnumerable<PostListDto>> GetLatestAsync(int page, int pageSize)
        {
            var result = (await _unitOfWork.Posts.GetLatestDtosAsync(page, pageSize)).ToList();
            // Fill UserReactions if user context available
            var currentUserId = GetCurrentUserId();
            if (currentUserId.HasValue)
            {
                await PopulateReactionsAndBookmarksAsync(result, currentUserId.Value);
            }
            _logger.LogInformation("Latest posts fetched. Page: {Page}, Size: {Size}", page, pageSize);
            return result;
        }

        public async Task<IEnumerable<PostListDto>> GetRelevantAsync(int? userId, int page, int pageSize)
        {
            var result = (await _unitOfWork.Posts.GetRelevantDtosAsync(userId, page, pageSize)).ToList();
            if (userId.HasValue)
            {
                await PopulateReactionsAndBookmarksAsync(result, userId.Value);
            }
            _logger.LogInformation("Relevant posts fetched. UserId: {UserId}, Page: {Page}, Size: {Size}", userId, page, pageSize);
            return result;
        }

        public async Task<IEnumerable<PostListDto>> GetTopAsync(int take)
        {
            var result = (await _unitOfWork.Posts.GetTopDtosAsync(take)).ToList();
            var currentUserId = GetCurrentUserId();
            if (currentUserId.HasValue)
            {
                await PopulateReactionsAndBookmarksAsync(result, currentUserId.Value);
            }
            _logger.LogInformation("Top posts fetched. Take: {Take}", take);
            return result;
        }
        private async Task PopulateReactionsAndBookmarksAsync(IReadOnlyCollection<PostListDto> posts, int? currentUserId)
        {
            if (posts == null || posts.Count == 0)
                return;

            var postIds = posts.Select(p => p.Id).ToList();

            // Reaction type counts for all posts
            var reactionTypeData = await _unitOfWork.Reactions
                .Query()
                .Where(r => postIds.Contains(r.post_id))
                .GroupBy(r => new { r.post_id, r.reaction_type })
                .Select(g => new { g.Key.post_id, g.Key.reaction_type, Count = g.Count() })
                .ToListAsync();

            var reactionTypesByPost = reactionTypeData
                .GroupBy(x => x.post_id)
                .ToDictionary(
                    g => g.Key,
                    g => g.ToDictionary(x => x.reaction_type, x => x.Count)
                );

            // Set ReactionTypes for each post
            foreach (var post in posts)
            {
                if (reactionTypesByPost.TryGetValue(post.Id, out var types))
                {
                    post.ReactionTypes = types;
                }
                else
                {
                    post.ReactionTypes = new Dictionary<string, int>();
                }
            }

            if (!currentUserId.HasValue)
                return;

            var userId = currentUserId.Value;

            // User reactions for all posts
            var userReactionsData = await _unitOfWork.Reactions
                .Query()
                .Where(r => r.user_id == userId && postIds.Contains(r.post_id))
                .Select(r => new { r.post_id, r.reaction_type })
                .ToListAsync();

            var userReactionsByPost = userReactionsData
                .GroupBy(x => x.post_id)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(x => x.reaction_type).ToList()
                );

            // Bookmarks for all posts
            var bookmarkedPostIds = await _unitOfWork.Bookmarks
                .Query()
                .Where(b => b.user_id == userId && postIds.Contains(b.post_id))
                .Select(b => b.post_id)
                .ToListAsync();

            var bookmarkedSet = new HashSet<int>(bookmarkedPostIds);

            foreach (var post in posts)
            {
                if (userReactionsByPost.TryGetValue(post.Id, out var userReactions))
                {
                    post.UserReactions = userReactions;
                    post.LikedByCurrentUser = userReactions.Contains("like");
                }
                else
                {
                    post.UserReactions = new List<string>();
                    post.LikedByCurrentUser = false;
                }

                post.BookmarkedByCurrentUser = bookmarkedSet.Contains(post.Id);
            }
        }

        // Helper to get current user id from context (if available)
        private int? GetCurrentUserId()
        {
            var httpContext = _httpContextAccessor?.HttpContext;
            if (httpContext == null || httpContext.User == null)
                return null;
            var userIdClaim = httpContext.User.Claims.FirstOrDefault(c => c.Type == "sub" || c.Type == "id" || c.Type.EndsWith("nameidentifier", StringComparison.OrdinalIgnoreCase));
            if (userIdClaim == null)
                return null;
            if (int.TryParse(userIdClaim.Value, out int userId))
                return userId;
            return null;
        }
        

        public async Task<bool> PublishAsync(int id, int requesterId)
        {
            var post = await _unitOfWork.Posts.GetByIdAsync(id);
            if (post == null) return false;

            if (post.user_id != requesterId)
                throw new UnauthorizedAccessException("You can only publish your own posts");

            if (post.status)
            {
                // Already published; ensure published_at is not unexpectedly null
                if (!post.published_at.HasValue)
                {
                    post.published_at = DateTime.UtcNow;
                    post.updated_at = DateTime.UtcNow;
                    _unitOfWork.Posts.Update(post);
                    await _unitOfWork.SaveChangesAsync();
                    _logger.LogInformation("Post had missing published_at fixed. PostId: {PostId}, UserId: {UserId}", id, requesterId);
                }
                return true;
            }

            post.status = true;
            if (!post.published_at.HasValue)
            {
                post.published_at = DateTime.UtcNow; // first publish timestamp
            }
            post.updated_at = DateTime.UtcNow;
            _unitOfWork.Posts.Update(post);
            await _unitOfWork.SaveChangesAsync();
            _logger.LogInformation("Post published. PostId: {PostId}, UserId: {UserId}", id, requesterId);
            return true;
        }
        public async Task<bool> UnpublishAsync(int id, int requesterId)
        {
            var post = await _unitOfWork.Posts.GetByIdAsync(id);
            if (post == null) return false;

            if (post.user_id != requesterId)
                throw new UnauthorizedAccessException("You can only unpublish your own posts");

            if (!post.status)
            {
                // Already draft
                return true;
            }

            post.status = false;
            // Business rule: reset published_at when reverting to draft
            post.published_at = null;
            post.updated_at = DateTime.UtcNow;

            _unitOfWork.Posts.Update(post);
            await _unitOfWork.SaveChangesAsync();
            _logger.LogInformation("Post unpublished (reverted to draft). PostId: {PostId}, UserId: {UserId}", id, requesterId);
            return true;
        }
        public async Task<bool> UpdateAsync(int id, UpdatePostDto dto, int requesterId)
        {
            var post = await _unitOfWork.Posts.Query()
                .Include(p => p.Translations)
                .FirstOrDefaultAsync(p => p.post_id == id);

            if (post == null)
            {
                _logger.LogWarning("Post not found for update. PostId: {PostId}", id);
                return false;
            }

            if (post.user_id != requesterId)
                throw new UnauthorizedAccessException("You can only update your own posts");

            // Ensure translations collection is initialized
            if (post.Translations == null)
            {
                post.Translations = new List<PostTranslation>();
            }

            // Determine the default language code (use existing if not changing, or new if provided)
            var defaultLanguageCode = !string.IsNullOrWhiteSpace(dto.DefaultLanguageCode) 
                ? dto.DefaultLanguageCode 
                : post.default_language_code;

            // Update Translations
            if (dto.Translations != null)
            {
                var dtoLanguageCodes = dto.Translations.Select(t => t.LanguageCode).ToHashSet();
                
                foreach (var transDto in dto.Translations)
                {
                    var translation = post.Translations.FirstOrDefault(t => t.language_code == transDto.LanguageCode);
                    if (translation != null)
                    {
                        // Update existing
                        if (!string.IsNullOrWhiteSpace(transDto.Title) && transDto.Title != translation.title)
                        {
                            translation.title = transDto.Title;
                            // Update slug
                            var slug = GenerateSlug(transDto.Title);
                            
                            var existingPost = await _unitOfWork.Posts.GetBySlugAsync(slug);
                            if (existingPost != null && existingPost.post_id != id)
                            {
                                var counter = 1;
                                var originalSlug = slug;
                                while (existingPost != null && existingPost.post_id != id)
                                {
                                    slug = $"{originalSlug}-{counter}";
                                    existingPost = await _unitOfWork.Posts.GetBySlugAsync(slug);
                                    counter++;
                                }
                            }
                            translation.slug = slug;
                        }
                        
                        if (!string.IsNullOrWhiteSpace(transDto.Content))
                        {
                            translation.content_markdown = transDto.Content;
                        }
                    }
                    else
                    {
                        // Add new translation
                        if (string.IsNullOrWhiteSpace(transDto.Title)) continue;
                        
                        var slug = GenerateSlug(transDto.Title);
                        var existingPost = await _unitOfWork.Posts.GetBySlugAsync(slug);
                        if (existingPost != null && existingPost.post_id != id)
                        {
                            var counter = 1;
                            var originalSlug = slug;
                            while (existingPost != null && existingPost.post_id != id)
                            {
                                slug = $"{originalSlug}-{counter}";
                                existingPost = await _unitOfWork.Posts.GetBySlugAsync(slug);
                                counter++;
                            }
                        }

                        post.Translations.Add(new PostTranslation
                        {
                            language_code = transDto.LanguageCode,
                            title = transDto.Title,
                            content_markdown = transDto.Content,
                            slug = slug
                        });
                    }
                }

                // Handle translation deletion: remove translations that are not in the DTO
                var translationsToDelete = post.Translations
                    .Where(t => !dtoLanguageCodes.Contains(t.language_code))
                    .ToList();

                // Validation: Ensure at least one translation remains after deletion
                if (post.Translations.Count - translationsToDelete.Count < 1)
                {
                    throw new InvalidOperationException("Cannot delete all translations. At least one translation must remain.");
                }

                // Validation: Prevent deletion of default language translation
                var defaultTranslationToDelete = translationsToDelete
                    .FirstOrDefault(t => t.language_code == defaultLanguageCode);
                
                if (defaultTranslationToDelete != null)
                {
                    throw new InvalidOperationException($"Cannot delete the default language translation ({defaultLanguageCode}). Change the default language first or ensure it remains in the translations list.");
                }

                // Delete translations that are no longer in the DTO
                foreach (var translationToDelete in translationsToDelete)
                {
                    post.Translations.Remove(translationToDelete);
                }
                
                // Recalculate reading time
                long maxReadingTime = 0;
                foreach(var t in post.Translations)
                {
                    var rt = CalculateReadingTimeMinutes(t.content_markdown);
                    if (rt > maxReadingTime) maxReadingTime = rt;
                }
                post.reading_time_minutes = maxReadingTime;
            }

            if (!string.IsNullOrWhiteSpace(dto.DefaultLanguageCode))
            {
                post.default_language_code = dto.DefaultLanguageCode;
            }

            // Update Cover Image
            if (!string.IsNullOrWhiteSpace(dto.CoverImageUrl))
                post.cover_img_url = dto.CoverImageUrl;

            // Update Tags only if provided and non-empty
            if (dto.Tags != null && dto.Tags.Count > 0)
            {
                // Remove all existing tags
                var existingPostTags = (await _unitOfWork.PostTags
                    .FindAsync(pt => pt.post_id == id)).ToList();
                foreach (var postTag in existingPostTags)
                {
                    _unitOfWork.PostTags.Delete(postTag);
                }
                await _unitOfWork.SaveChangesAsync();

                // Add new tags
                await AddTagsToPostBatchAsync(id, dto.Tags);
            }

            // Update Publish Status
            if (dto.PublishNow.HasValue)
            {
                if (dto.PublishNow.Value && !post.status)
                {
                    // Publish
                    post.status = true;
                    if (!post.published_at.HasValue)
                    {
                        post.published_at = DateTime.UtcNow;
                    }
                }
                else if (!dto.PublishNow.Value && post.status)
                {
                    // Unpublish
                    post.status = false;
                    post.published_at = null;
                }
            }

            post.updated_at = DateTime.UtcNow;

            _unitOfWork.Posts.Update(post);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Post updated. PostId: {PostId}, UserId: {UserId}, Title: {Title}, Tags: {TagCount}", 
                id, requesterId, "Multi-language Post", dto.Tags?.Count ?? 0);
            return true;
        }

        private long CalculateReadingTimeMinutes(string content)
        {
            if (string.IsNullOrWhiteSpace(content))
            {
                return 0;
            }

            var words = content
                .Split(new[] { ' ', '\n', '\r', '\t' }, StringSplitOptions.RemoveEmptyEntries);

            var wordCount = words.Length;

            if (wordCount == 0)
            {
                return 0;
            }

            const int wordsPerMinute = 200;
            var minutes = (int)Math.Ceiling(wordCount / (double)wordsPerMinute);

            return minutes < 1 ? 1 : minutes;
        }

        private string GenerateSlug(string title)
        {
            var slug = title.ToLowerInvariant();

            slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\s-]", "");

            slug = System.Text.RegularExpressions.Regex.Replace(slug, @"\s+", "-");

            slug = System.Text.RegularExpressions.Regex.Replace(slug, @"-+", "-");

            slug = slug.Trim('-');

            return slug;
        }

        public async Task<bool> ToggleLikeAsync(int postId, int userId)
        {
            var post = await _unitOfWork.Posts.GetByIdAsync(postId);
            if (post == null) return false;

            var existingLike = await _unitOfWork.Reactions
                .FirstOrDefaultAsync(r => r.post_id == postId && r.user_id == userId && r.reaction_type == "like");

            if (existingLike != null)
            {
                // Unlike - remove reaction
                _unitOfWork.Reactions.Delete(existingLike);
                post.likes_count = Math.Max(0, post.likes_count - 1);
                _logger.LogInformation("Post unliked. PostId: {PostId}, UserId: {UserId}", postId, userId);
            }
            else
            {
                // Like - add reaction
                var reaction = new Models.Entities.Reaction
                {
                    post_id = postId,
                    user_id = userId,
                    reaction_type = "like",
                    created_at = DateTime.UtcNow
                };
                await _unitOfWork.Reactions.AddAsync(reaction);
                post.likes_count++;
                _logger.LogInformation("Post liked. PostId: {PostId}, UserId: {UserId}", postId, userId);
            }

            _unitOfWork.Posts.Update(post);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ToggleBookmarkAsync(int postId, int userId)
        {
            var post = await _unitOfWork.Posts.GetByIdAsync(postId);
            if (post == null) return false;

            var existingBookmark = await _unitOfWork.Bookmarks
                .FirstOrDefaultAsync(b => b.post_id == postId && b.user_id == userId);

            if (existingBookmark != null)
            {
                // Remove bookmark
                _unitOfWork.Bookmarks.Delete(existingBookmark);
                post.bookmarks_count = Math.Max(0, post.bookmarks_count - 1);
                _logger.LogInformation("Post unbookmarked. PostId: {PostId}, UserId: {UserId}", postId, userId);
            }
            else
            {
                // Add bookmark
                var bookmark = new Models.Entities.Bookmark
                {
                    post_id = postId,
                    user_id = userId,
                    created_at = DateTime.UtcNow
                };
                await _unitOfWork.Bookmarks.AddAsync(bookmark);
                post.bookmarks_count++;
                _logger.LogInformation("Post bookmarked. PostId: {PostId}, UserId: {UserId}", postId, userId);
            }

            _unitOfWork.Posts.Update(post);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AddTagToPostAsync(int postId, string tagName, int userId)
        {
            var post = await _unitOfWork.Posts.GetByIdAsync(postId);
            if (post == null) return false;

            if (post.user_id != userId)
                throw new UnauthorizedAccessException("You can only add tags to your own posts");

            return await AddTagToPostInternalAsync(postId, tagName);
        }

        private async Task<bool> AddTagToPostInternalAsync(int postId, string tagName)
        {
            tagName = tagName.Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(tagName)) return false;

            // Find or create tag
            var tag = await _unitOfWork.Tags.FirstOrDefaultAsync(t => t.name == tagName);
            if (tag == null)
            {
                tag = new Models.Entities.Tag
                {
                    name = tagName
                };
                await _unitOfWork.Tags.AddAsync(tag);
                await _unitOfWork.SaveChangesAsync();
            }

            // Check if already linked
            var existingLink = await _unitOfWork.PostTags
                .FirstOrDefaultAsync(pt => pt.post_id == postId && pt.tag_id == tag.tag_id);

            if (existingLink != null) return true; // Already exists

            // Create link
            var postTag = new Models.Entities.PostTag
            {
                post_id = postId,
                tag_id = tag.tag_id
            };
            await _unitOfWork.PostTags.AddAsync(postTag);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Tag added to post. PostId: {PostId}, Tag: {TagName}", postId, tagName);
            return true;
        }

        private async Task AddTagsToPostBatchAsync(int postId, List<string> tagNames)
        {
            if (tagNames == null || !tagNames.Any()) return;

            var normalizedTags = tagNames
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Select(t => t.Trim().ToLowerInvariant())
                .Distinct()
                .ToList();

            if (!normalizedTags.Any()) return;

            // 1. Find existing tags
            var existingTags = await _unitOfWork.Tags
                .Query()
                .Where(t => normalizedTags.Contains(t.name))
                .ToListAsync();

            var existingTagNames = existingTags.Select(t => t.name).ToList();
            var newTagNames = normalizedTags.Except(existingTagNames).ToList();

            // 2. Create missing tags
            if (newTagNames.Any())
            {
                var newTags = newTagNames.Select(name => new Models.Entities.Tag { name = name }).ToList();
                await _unitOfWork.Tags.AddRangeAsync(newTags);
                await _unitOfWork.SaveChangesAsync();
                existingTags.AddRange(newTags);
            }

            // 3. Get all tag IDs
            var tagIds = existingTags.Select(t => t.tag_id).ToList();

            // 4. Find existing links to avoid duplicates
            var existingLinks = await _unitOfWork.PostTags
                .Query()
                .Where(pt => pt.post_id == postId && tagIds.Contains(pt.tag_id))
                .Select(pt => pt.tag_id)
                .ToListAsync();

            // 5. Create new links
            var newLinks = tagIds
                .Except(existingLinks)
                .Select(tagId => new Models.Entities.PostTag
                {
                    post_id = postId,
                    tag_id = tagId
                })
                .ToList();

            if (newLinks.Any())
            {
                await _unitOfWork.PostTags.AddRangeAsync(newLinks);
                await _unitOfWork.SaveChangesAsync();
            }
        }

        private async Task<bool> AddTagToPostByIdInternalAsync(int postId, int tagId)
        {
            // Check if tag exists
            var tag = await _unitOfWork.Tags.GetByIdAsync(tagId);
            if (tag == null)
            {
                _logger.LogWarning("Tag not found. TagId: {TagId}", tagId);
                return false;
            }

            // Check if already linked
            var existingLink = await _unitOfWork.PostTags
                .FirstOrDefaultAsync(pt => pt.post_id == postId && pt.tag_id == tagId);

            if (existingLink != null) return true; // Already exists

            // Create link
            var postTag = new Models.Entities.PostTag
            {
                post_id = postId,
                tag_id = tagId
            };
            await _unitOfWork.PostTags.AddAsync(postTag);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Tag added to post by ID. PostId: {PostId}, TagId: {TagId}", postId, tagId);
            return true;
        }

        public async Task<bool> RemoveTagFromPostAsync(int postId, int tagId, int userId)
        {
            var post = await _unitOfWork.Posts.GetByIdAsync(postId);
            if (post == null) return false;

            if (post.user_id != userId)
                throw new UnauthorizedAccessException("You can only remove tags from your own posts");

            var postTag = await _unitOfWork.PostTags
                .FirstOrDefaultAsync(pt => pt.post_id == postId && pt.tag_id == tagId);

            if (postTag == null) return false;

            _unitOfWork.PostTags.Delete(postTag);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Tag removed from post. PostId: {PostId}, TagId: {TagId}", postId, tagId);
            return true;
        }

        //search posts
        public async Task<IEnumerable<PostListDto>> SearchPostsAsync(string query, int? userId, int page = 1, int pageSize = 20)
        {
            // Use repository from UnitOfWork to avoid null reference issues
            return await _unitOfWork.Posts.SearchInDbAsync(query, userId, page, pageSize);
        }

        // Get posts bookmarked by a user
        public async Task<IEnumerable<PostListDto>> GetBookmarkedPostsAsync(int userId, int page, int pageSize)
        {
            var bookmarkedPostIds = await _unitOfWork.Bookmarks
                .Query()
                .Where(b => b.user_id == userId)
                .OrderByDescending(b => b.created_at)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(b => b.post_id)
                .ToListAsync();

            var posts = await _unitOfWork.Posts
                .Query()
                .Where(p => bookmarkedPostIds.Contains(p.post_id))
                .Include(p => p.User)
                .Include(p => p.Translations)
                .Include(p => p.PostTags).ThenInclude(pt => pt.Tag)
                .ToListAsync();

            // Batch fetch all reactions for these posts (fixes N+1 query problem)
            var userReactions = await _unitOfWork.Reactions
                .Query()
                .Where(r => bookmarkedPostIds.Contains(r.post_id) && r.user_id == userId)
                .Select(r => new { r.post_id, r.reaction_type })
                .ToListAsync();

            var allReactionCounts = await _unitOfWork.Reactions
                .Query()
                .Where(r => bookmarkedPostIds.Contains(r.post_id))
                .GroupBy(r => new { r.post_id, r.reaction_type })
                .Select(g => new { g.Key.post_id, g.Key.reaction_type, Count = g.Count() })
                .ToListAsync();

            // Create lookup dictionaries for O(1) access
            var userReactionsLookup = userReactions
                .GroupBy(r => r.post_id)
                .ToDictionary(g => g.Key, g => g.Select(r => r.reaction_type).ToList());

            var reactionCountsLookup = allReactionCounts
                .GroupBy(r => r.post_id)
                .ToDictionary(g => g.Key, g => g.ToDictionary(r => r.reaction_type, r => r.Count));

            var postDtos = posts.Select(p => 
            {
                var postUserReactions = userReactionsLookup.GetValueOrDefault(p.post_id) ?? new List<string>();
                var postReactionTypes = reactionCountsLookup.GetValueOrDefault(p.post_id) ?? new Dictionary<string, int>();
                
                return new PostListDto
                {
                    Id = p.post_id,
                    Title = p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code)?.title ?? p.Translations.FirstOrDefault()?.title ?? "",
                    Slug = p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code)?.slug ?? p.Translations.FirstOrDefault()?.slug ?? "",
                    Excerpt = (p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code)?.content_markdown ?? p.Translations.FirstOrDefault()?.content_markdown ?? "").Length > 200 
                            ? (p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code)?.content_markdown ?? p.Translations.FirstOrDefault()?.content_markdown ?? "").Substring(0, 200) 
                            : (p.Translations.FirstOrDefault(t => t.language_code == p.default_language_code)?.content_markdown ?? p.Translations.FirstOrDefault()?.content_markdown ?? ""),
                    CoverImageUrl = p.cover_img_url,
                    AuthorDisplayName = p.User != null ? p.User.display_name : string.Empty,
                    PublishedAt = p.published_at,
                    Likes = p.likes_count,
                    CommentsCount = p.Comments != null ? p.Comments.Count : 0,
                    Views = p.view_count,
                    BookmarksCount = p.bookmarks_count,
                    ReadingTimeMinutes = p.reading_time_minutes,
                    Tags = p.PostTags.Where(pt => pt.Tag != null).Select(pt => pt.Tag!.name).ToList(),
                    ReactionTypes = postReactionTypes,
                    UserReactions = postUserReactions,
                    LikedByCurrentUser = postUserReactions.Contains("like"),
                    BookmarkedByCurrentUser = true
                };
            }).ToList();

            _logger.LogInformation("Bookmarked posts fetched. UserId: {UserId}, Page: {Page}, Size: {Size}", userId, page, pageSize);
            return postDtos;
        }

    }
}

using SourceDev.API.DTOs.Post;
using SourceDev.API.Models.Entities;
using SourceDev.API.Repositories;
using SourceDev.API.Models;

namespace SourceDev.API.Services
{
    public class PostService : IPostService //VALIDATORLAR EKLENECEK
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<PostService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly PostRepository _postRepository;
        public PostService(IUnitOfWork unitOfWork, ILogger<PostService> logger, IServiceScopeFactory scopeFactory)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _scopeFactory = scopeFactory;
        }
        private void QueueIncrementViewCount(int postId)
        {
            _ = Task.Run(async () =>
            {
                using var scope = _scopeFactory.CreateScope();
                var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<PostService>>();

                try
                {
                    var post = await uow.Posts.GetByIdAsync(postId);
                    if (post != null)
                    {
                        post.view_count++;
                        uow.Posts.Update(post);
                        await uow.SaveChangesAsync();
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error incrementing view count. PostId: {PostId}", postId);
                }
            });
        }
        public async Task<PostDto> CreateAsync(CreatePostDto dto, int authorId)
        {
            if (string.IsNullOrWhiteSpace(dto.Content))
            {
                throw new ArgumentException("Content is required", nameof(dto.Content));
            }
            if (string.IsNullOrWhiteSpace(dto.Title))
            {
                throw new ArgumentException("Title is required", nameof(dto.Title));
            }

            var slug = GenerateSlug(dto.Title);
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

            var post = new Post
            {
                user_id = authorId,  // ← Entity property isimleri
                slug = slug,
                content_markdown = dto.Content,
                cover_img_url = dto.CoverImageUrl,
                status = dto.PublishNow,  // ← true/false
                published_at = dto.PublishNow ? DateTime.UtcNow : default,  // ← default yerine DateTime.MinValue
                created_at = DateTime.UtcNow,
                updated_at = DateTime.UtcNow,
                likes_count = 0,
                bookmarks_count = 0,
                view_count = 0
            };
            await _unitOfWork.Posts.AddAsync(post);
            await _unitOfWork.SaveChangesAsync();

            // Add tags if provided
            if (dto.Tags != null && dto.Tags.Any())
            {
                foreach (var tagName in dto.Tags)
                {
                    await AddTagToPostInternalAsync(post.post_id, tagName);
                }
            }

            var createdPostDto = await _unitOfWork.Posts.GetDtoByIdAsync(post.post_id);
            if (createdPostDto == null)
            {
                throw new InvalidOperationException("Failed to retrieve created post");
            }
            _logger.LogInformation("Post created successfully. PostId: {PostId}, Slug: {Slug}",
                    post.post_id, post.slug);

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
                postDto.LikedByCurrentUser = await _unitOfWork.Reactions
                    .AnyAsync(r => r.post_id == id && r.user_id == currentUserId.Value);

                postDto.BookmarkedByCurrentUser = await _unitOfWork.Bookmarks
                    .AnyAsync(b => b.post_id == id && b.user_id == currentUserId.Value);
            }

            // View count artır (fire-and-forget - performans için asenkron)
            _ = Task.Run(async () =>
            {
                try
                {
                    QueueIncrementViewCount(id);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error incrementing view count. PostId: {PostId}", id);
                }
            });

            _logger.LogInformation("Post retrieved. PostId: {PostId}, UserId: {UserId}", id, currentUserId);

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
                postDto.LikedByCurrentUser = await _unitOfWork.Reactions
                    .AnyAsync(r => r.post_id == postDto.Id && r.user_id == currentUserId.Value);

                postDto.BookmarkedByCurrentUser = await _unitOfWork.Bookmarks
                    .AnyAsync(b => b.post_id == postDto.Id && b.user_id == currentUserId.Value);
            }

            _ = Task.Run(async () =>
            {
                try
                {
                    QueueIncrementViewCount(postDto.Id);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error incrementing view count. PostId: {PostId}", postDto.Id);
                }
            });

            _logger.LogInformation("Post retrieved. Slug: {Slug}, PostId: {PostId}, UserId: {UserId}", slug, postDto.Id, currentUserId);

            return postDto;
        }

        public async Task<IEnumerable<PostListDto>> GetByTagAsync(string tagSlug, int page, int pageSize)
        {
            var result = await _unitOfWork.Posts.GetByTagDtosAsync(tagSlug, page, pageSize);
            _logger.LogInformation("Posts by tag fetched. Tag: {Tag}, Page: {Page}, Size: {Size}", tagSlug, page, pageSize);
            return result;
        }

        public async Task<IEnumerable<PostListDto>> GetByUserAsync(int userId, int page, int pageSize)
        {
            var result = await _unitOfWork.Posts.GetByUserDtosAsync(userId, page, pageSize);
            _logger.LogInformation("Posts by user fetched. UserId: {UserId}, Page: {Page}, Size: {Size}", userId, page, pageSize);
            return result;
        }

        public async Task<IEnumerable<PostListDto>> GetLatestAsync(int page, int pageSize)
        {
            var result = await _unitOfWork.Posts.GetLatestDtosAsync(page, pageSize);
            _logger.LogInformation("Latest posts fetched. Page: {Page}, Size: {Size}", page, pageSize);
            return result;
        }

        public async Task<IEnumerable<PostListDto>> GetRelevantAsync(int? userId, int page, int pageSize)
        {
            var result = await _unitOfWork.Posts.GetRelevantDtosAsync(userId, page, pageSize);
            _logger.LogInformation("Relevant posts fetched. UserId: {UserId}, Page: {Page}, Size: {Size}", userId, page, pageSize);
            return result;
        }

        public async Task<IEnumerable<PostListDto>> GetTopAsync(int take)
        {
            var result = await _unitOfWork.Posts.GetTopDtosAsync(take);
            _logger.LogInformation("Top posts fetched. Take: {Take}", take);
            return result;
        }

        public async Task<bool> PublishAsync(int id, int requesterId)
        {
            var post = await _unitOfWork.Posts.GetByIdAsync(id);
            if (post == null) return false;

            if (post.user_id != requesterId)
                throw new UnauthorizedAccessException("You can only publish your own posts");

            if (!post.status)
            {
                post.status = true;
                post.published_at = DateTime.UtcNow;
                post.updated_at = DateTime.UtcNow;

                _unitOfWork.Posts.Update(post);
                await _unitOfWork.SaveChangesAsync();
                _logger.LogInformation("Post published. PostId: {PostId}, UserId: {UserId}", id, requesterId);
            }

            return true;
        }
        public async Task<bool> UnpublishAsync(int id, int requesterId)
        {
            var post = await _unitOfWork.Posts.GetByIdAsync(id);
            if (post == null) return false;

            if (post.user_id != requesterId)
                throw new UnauthorizedAccessException("You can only unpublish your own posts");

            if (post.status)
            {
                post.status = false;
                post.updated_at = DateTime.UtcNow;

                _unitOfWork.Posts.Update(post);
                await _unitOfWork.SaveChangesAsync();
                _logger.LogInformation("Post unpublished. PostId: {PostId}, UserId: {UserId}", id, requesterId);
            }

            return true;
        }
        public async Task<bool> UpdateAsync(int id, UpdatePostDto dto, int requesterId)
        {
            var post = await _unitOfWork.Posts.GetByIdAsync(id);
            if (post == null)
            {
                _logger.LogWarning("Post not found for update. PostId: {PostId}", id);
                return false;
            }

            if (post.user_id != requesterId)
                throw new UnauthorizedAccessException("You can only update your own posts");

            if (!string.IsNullOrWhiteSpace(dto.Content))
                post.content_markdown = dto.Content;

            if (!string.IsNullOrWhiteSpace(dto.CoverImageUrl))
                post.cover_img_url = dto.CoverImageUrl;

            post.updated_at = DateTime.UtcNow;

            _unitOfWork.Posts.Update(post);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Post updated. PostId: {PostId}, UserId: {UserId}", id, requesterId);
            return true;
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

        //search
        public async Task<IEnumerable<PostListDto>> SearchAsync(string query, int? userId, int page = 1, int pageSize = 20)
        {
            return await _postRepository.SearchInDbAsync(query, userId, page, pageSize);
        }

    }
}

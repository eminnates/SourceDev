using SourceDev.API.DTOs.Post;
using SourceDev.API.Models.Entities;
using SourceDev.API.Repositories;

namespace SourceDev.API.Services
{
    public class PostService : IPostService //VALIDATORLAR EKLENECEK
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<PostService> _logger;
        public PostService(IUnitOfWork unitOfWork, ILogger<PostService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<PostDto> CreateAsync(CreatePostDto dto, int authorId)
        {
            if (string.IsNullOrWhiteSpace(dto.Content))
            {
                throw new ArgumentException("Content is required", nameof(dto.Content));
            }
            if (string.IsNullOrWhiteSpace(dto.Slug))
            {
                throw new ArgumentException("Slug is required", nameof(dto.Slug));
            }
            var existingPost = await _unitOfWork.Posts.GetBySlugAsync(dto.Slug);
            if (existingPost != null)
            {
                throw new InvalidOperationException($"A post with slug '{dto.Slug}' already exists");
            }
            var post = new Post
            {
                user_id = authorId,  // ← Entity property isimleri
                slug = dto.Slug,
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

        public Task<PostDto?> GetByIdAsync(int id, int? currentUserId = null)
        {
            throw new NotImplementedException();
        }

        public Task<PostDto?> GetBySlugAsync(string slug, int? currentUserId = null)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<PostListDto>> GetByTagAsync(string tagSlug, int page, int pageSize)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<PostListDto>> GetByUserAsync(int userId, int page, int pageSize)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<PostListDto>> GetLatestAsync(int page, int pageSize)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<PostListDto>> GetRelevantAsync(int? userId, int page, int pageSize)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<PostListDto>> GetTopAsync(int take)
        {
            throw new NotImplementedException();
        }

        public Task<bool> PublishAsync(int id, int requesterId)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UnpublishAsync(int id, int requesterId)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateAsync(int id, UpdatePostDto dto, int requesterId)
        {
            throw new NotImplementedException();
        }
    }
}

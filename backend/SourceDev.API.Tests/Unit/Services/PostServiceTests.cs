using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using SourceDev.API.DTOs.Post;
using SourceDev.API.Models.Entities;
using SourceDev.API.Repositories;
using SourceDev.API.Services;
using SourceDev.API.Services.Background;
using SourceDev.API.Tests.Helpers;
using System.Linq.Expressions;

namespace SourceDev.API.Tests.Unit.Services;

public class PostServiceTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IPostRepository> _postRepositoryMock;
    private readonly Mock<IRepository<Reaction>> _reactionRepositoryMock;
    private readonly Mock<IRepository<Bookmark>> _bookmarkRepositoryMock;
    private readonly Mock<ITagRepository> _tagRepositoryMock;
    private readonly Mock<IRepository<PostTag>> _postTagRepositoryMock;
    private readonly Mock<ILogger<PostService>> _loggerMock;
    private readonly Mock<IServiceScopeFactory> _scopeFactoryMock;
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
    private readonly Mock<IViewCountQueue> _viewCountQueueMock;
    private readonly PostService _postService;

    public PostServiceTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _postRepositoryMock = new Mock<IPostRepository>();
        _reactionRepositoryMock = new Mock<IRepository<Reaction>>();
        _bookmarkRepositoryMock = new Mock<IRepository<Bookmark>>();
        _tagRepositoryMock = new Mock<ITagRepository>();
        _postTagRepositoryMock = new Mock<IRepository<PostTag>>();
        _loggerMock = new Mock<ILogger<PostService>>();
        _scopeFactoryMock = new Mock<IServiceScopeFactory>();
        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
        _viewCountQueueMock = new Mock<IViewCountQueue>();

        _unitOfWorkMock.Setup(u => u.Posts).Returns(_postRepositoryMock.Object);
        _unitOfWorkMock.Setup(u => u.Reactions).Returns(_reactionRepositoryMock.Object);
        _unitOfWorkMock.Setup(u => u.Bookmarks).Returns(_bookmarkRepositoryMock.Object);
        _unitOfWorkMock.Setup(u => u.Tags).Returns(_tagRepositoryMock.Object);
        _unitOfWorkMock.Setup(u => u.PostTags).Returns(_postTagRepositoryMock.Object);

        _postService = new PostService(
            _unitOfWorkMock.Object,
            _loggerMock.Object,
            _scopeFactoryMock.Object,
            _httpContextAccessorMock.Object,
            _viewCountQueueMock.Object
        );
    }

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_WhenNoTranslations_ShouldThrowArgumentException()
    {
        // Arrange
        var dto = new CreatePostDto
        {
            Translations = new List<PostTranslationInputDto>(),
            DefaultLanguageCode = "tr"
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => _postService.CreateAsync(dto, 1));
        
        ex.ParamName.Should().Be("Translations");
    }

    [Fact]
    public async Task CreateAsync_WhenTranslationsNull_ShouldThrowArgumentException()
    {
        // Arrange
        var dto = new CreatePostDto
        {
            Translations = null!,
            DefaultLanguageCode = "tr"
        };

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(
            () => _postService.CreateAsync(dto, 1));
    }

    [Fact]
    public async Task CreateAsync_WhenDefaultLanguageMissing_ShouldThrowArgumentException()
    {
        // Arrange
        var dto = new CreatePostDto
        {
            Translations = new List<PostTranslationInputDto>
            {
                new PostTranslationInputDto { LanguageCode = "en", Title = "Title", Content = "Content" }
            },
            DefaultLanguageCode = "tr" // But no "tr" translation provided
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => _postService.CreateAsync(dto, 1));
        
        ex.ParamName.Should().Be("DefaultLanguageCode");
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_WhenPostNotFound_ShouldReturnFalse()
    {
        // Arrange
        _postRepositoryMock.Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((Post?)null);

        // Act
        var result = await _postService.DeleteAsync(999, 1);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteAsync_WhenAlreadyDeleted_ShouldReturnFalse()
    {
        // Arrange
        var post = TestDataFactory.CreatePost(1, 1);
        post.deleted_at = DateTime.UtcNow;

        _postRepositoryMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(post);

        // Act
        var result = await _postService.DeleteAsync(1, 1);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteAsync_WhenNotOwner_ShouldThrowException()
    {
        // Arrange
        var post = TestDataFactory.CreatePost(1, 2); // owned by user 2

        _postRepositoryMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(post);

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(
            () => _postService.DeleteAsync(1, 1)); // user 1 trying to delete
    }

    [Fact]
    public async Task DeleteAsync_WhenOwner_ShouldSoftDeleteAndReturnTrue()
    {
        // Arrange
        var post = TestDataFactory.CreatePost(1, 1);
        post.deleted_at = null;

        _postRepositoryMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(post);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _postService.DeleteAsync(1, 1);

        // Assert
        result.Should().BeTrue();
        post.deleted_at.Should().NotBeNull();
        post.status.Should().BeFalse();
        _postRepositoryMock.Verify(r => r.Update(post), Times.Once);
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_WhenPostNotFound_ShouldReturnNull()
    {
        // Arrange
        _postRepositoryMock.Setup(r => r.GetDtoByIdAsync(999))
            .ReturnsAsync((PostDto?)null);

        // Act
        var result = await _postService.GetByIdAsync(999);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByIdAsync_WhenDraftAndNotOwner_ShouldReturnNull()
    {
        // Arrange
        var postDto = TestDataFactory.CreatePostDto(1, 2);
        postDto.Status = false; // Draft

        _postRepositoryMock.Setup(r => r.GetDtoByIdAsync(1))
            .ReturnsAsync(postDto);

        // Act
        var result = await _postService.GetByIdAsync(1, 1); // user 1, not owner

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByIdAsync_WhenDraftAndOwner_ShouldReturnPost()
    {
        // Arrange
        var postDto = TestDataFactory.CreatePostDto(1, 1);
        postDto.Status = false; // Draft

        _postRepositoryMock.Setup(r => r.GetDtoByIdAsync(1))
            .ReturnsAsync(postDto);
        _viewCountQueueMock.Setup(v => v.QueueViewCountAsync(1))
            .Returns(ValueTask.CompletedTask);

        // Act
        var result = await _postService.GetByIdAsync(1, 1); // owner

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(1);
    }

    [Fact]
    public async Task GetByIdAsync_WhenPublished_ShouldReturnPost()
    {
        // Arrange
        var postDto = TestDataFactory.CreatePostDto(1, 2);
        postDto.Status = true; // Published

        _postRepositoryMock.Setup(r => r.GetDtoByIdAsync(1))
            .ReturnsAsync(postDto);
        _viewCountQueueMock.Setup(v => v.QueueViewCountAsync(1))
            .Returns(ValueTask.CompletedTask);

        // Act
        var result = await _postService.GetByIdAsync(1);

        // Assert
        result.Should().NotBeNull();
    }

    #endregion

    #region GetForEditAsync Tests

    [Fact]
    public async Task GetForEditAsync_WhenPostNotFound_ShouldReturnNull()
    {
        // Arrange
        _postRepositoryMock.Setup(r => r.GetDtoByIdAsync(999))
            .ReturnsAsync((PostDto?)null);

        // Act
        var result = await _postService.GetForEditAsync(999, 1);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetForEditAsync_WhenNotOwner_ShouldThrowUnauthorizedAccessException()
    {
        // Arrange
        var postDto = TestDataFactory.CreatePostDto(1, 2);

        _postRepositoryMock.Setup(r => r.GetDtoByIdAsync(1))
            .ReturnsAsync(postDto);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _postService.GetForEditAsync(1, 1));
    }

    [Fact]
    public async Task GetForEditAsync_WhenOwner_ShouldReturnPost()
    {
        // Arrange
        var postDto = TestDataFactory.CreatePostDto(1, 1);

        _postRepositoryMock.Setup(r => r.GetDtoByIdAsync(1))
            .ReturnsAsync(postDto);

        // Act
        var result = await _postService.GetForEditAsync(1, 1);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(1);
    }

    #endregion

    #region PublishAsync Tests

    [Fact]
    public async Task PublishAsync_WhenPostNotFound_ShouldReturnFalse()
    {
        // Arrange
        _postRepositoryMock.Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((Post?)null);

        // Act
        var result = await _postService.PublishAsync(999, 1);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task PublishAsync_WhenNotOwner_ShouldThrowUnauthorizedAccessException()
    {
        // Arrange
        var post = TestDataFactory.CreatePost(1, 2);

        _postRepositoryMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(post);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _postService.PublishAsync(1, 1));
    }

    [Fact]
    public async Task PublishAsync_WhenDraft_ShouldPublishAndReturnTrue()
    {
        // Arrange
        var post = TestDataFactory.CreatePost(1, 1, false);
        post.status = false;
        post.published_at = null;

        _postRepositoryMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(post);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _postService.PublishAsync(1, 1);

        // Assert
        result.Should().BeTrue();
        post.status.Should().BeTrue();
        post.published_at.Should().NotBeNull();
    }

    #endregion

    #region UnpublishAsync Tests

    [Fact]
    public async Task UnpublishAsync_WhenPostNotFound_ShouldReturnFalse()
    {
        // Arrange
        _postRepositoryMock.Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((Post?)null);

        // Act
        var result = await _postService.UnpublishAsync(999, 1);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task UnpublishAsync_WhenNotOwner_ShouldThrowUnauthorizedAccessException()
    {
        // Arrange
        var post = TestDataFactory.CreatePost(1, 2);

        _postRepositoryMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(post);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _postService.UnpublishAsync(1, 1));
    }

    [Fact]
    public async Task UnpublishAsync_WhenPublished_ShouldUnpublishAndReturnTrue()
    {
        // Arrange
        var post = TestDataFactory.CreatePost(1, 1, true);
        post.status = true;

        _postRepositoryMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(post);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _postService.UnpublishAsync(1, 1);

        // Assert
        result.Should().BeTrue();
        post.status.Should().BeFalse();
        post.published_at.Should().BeNull();
    }

    #endregion

    #region ToggleLikeAsync Tests

    [Fact]
    public async Task ToggleLikeAsync_WhenPostNotFound_ShouldReturnFalse()
    {
        // Arrange
        _postRepositoryMock.Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((Post?)null);

        // Act
        var result = await _postService.ToggleLikeAsync(999, 1);

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region ToggleBookmarkAsync Tests

    [Fact]
    public async Task ToggleBookmarkAsync_WhenPostNotFound_ShouldReturnFalse()
    {
        // Arrange
        _postRepositoryMock.Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((Post?)null);

        // Act
        var result = await _postService.ToggleBookmarkAsync(999, 1);

        // Assert
        result.Should().BeFalse();
    }

    #endregion
}

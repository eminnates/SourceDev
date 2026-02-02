using Microsoft.Extensions.Logging;
using Moq;
using SourceDev.API.Models.Entities;
using SourceDev.API.Repositories;
using SourceDev.API.Services;
using SourceDev.API.Tests.Helpers;
using System.Linq.Expressions;

namespace SourceDev.API.Tests.Unit.Services;

public class CommentServiceTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IPostRepository> _postRepositoryMock;
    private readonly Mock<IRepository<Comment>> _commentRepositoryMock;
    private readonly Mock<ILogger<CommentService>> _loggerMock;
    private readonly CommentService _commentService;

    public CommentServiceTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _postRepositoryMock = new Mock<IPostRepository>();
        _commentRepositoryMock = new Mock<IRepository<Comment>>();
        _loggerMock = new Mock<ILogger<CommentService>>();

        _unitOfWorkMock.Setup(u => u.Posts).Returns(_postRepositoryMock.Object);
        _unitOfWorkMock.Setup(u => u.Comments).Returns(_commentRepositoryMock.Object);

        _commentService = new CommentService(_unitOfWorkMock.Object, _loggerMock.Object);
    }

    #region AddAsync Tests

    [Fact]
    public async Task AddAsync_WhenContentIsEmpty_ShouldThrowArgumentException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(
            () => _commentService.AddAsync(1, 1, ""));
    }

    [Fact]
    public async Task AddAsync_WhenContentIsWhitespace_ShouldThrowArgumentException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(
            () => _commentService.AddAsync(1, 1, "   "));
    }

    [Fact]
    public async Task AddAsync_WhenPostNotFound_ShouldThrowInvalidOperationException()
    {
        // Arrange
        _postRepositoryMock.Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((Post?)null);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _commentService.AddAsync(999, 1, "Test comment"));
    }

    [Fact]
    public async Task AddAsync_WithInvalidParentComment_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var post = TestDataFactory.CreatePost(1);
        
        _postRepositoryMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(post);
        _commentRepositoryMock.Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((Comment?)null);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _commentService.AddAsync(1, 1, "Reply comment", 999));
    }

    [Fact]
    public async Task AddAsync_WithValidData_ShouldCreateComment()
    {
        // Arrange
        var post = TestDataFactory.CreatePost(1);
        var user = TestDataFactory.CreateUser(1);
        var content = "This is a test comment";

        _postRepositoryMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(post);
        _commentRepositoryMock.Setup(r => r.AddAsync(It.IsAny<Comment>()))
            .ReturnsAsync((Comment c) => c);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Setup Query to return empty list for the reload operation
        var comments = new List<Comment>();
        var queryable = AsyncQueryableHelper.BuildMockDbSet(comments);
        _commentRepositoryMock.Setup(r => r.Query())
            .Returns(queryable);

        // Act
        var result = await _commentService.AddAsync(1, 1, content);

        // Assert
        result.Should().NotBeNull();
        result.Content.Should().Be(content);
        _commentRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Comment>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_WhenCommentNotFound_ShouldReturnFalse()
    {
        // Arrange
        _commentRepositoryMock.Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((Comment?)null);

        // Act
        var result = await _commentService.DeleteAsync(999, 1);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteAsync_WhenNotOwner_ShouldThrowUnauthorizedAccessException()
    {
        // Arrange
        var comment = TestDataFactory.CreateComment(1, 1, 2); // userId 2 owns the comment

        _commentRepositoryMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(comment);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _commentService.DeleteAsync(1, 1)); // userId 1 trying to delete
    }

    [Fact]
    public async Task DeleteAsync_WhenOwner_ShouldDeleteAndReturnTrue()
    {
        // Arrange
        var comment = TestDataFactory.CreateComment(1, 1, 1);

        _commentRepositoryMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(comment);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _commentService.DeleteAsync(1, 1);

        // Assert
        result.Should().BeTrue();
        _commentRepositoryMock.Verify(r => r.Delete(comment), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    #endregion

    #region GetByPostAsync Tests

    [Fact]
    public async Task GetByPostAsync_WithInvalidPage_ShouldReturnEmpty()
    {
        // Act
        var result = await _commentService.GetByPostAsync(1, 0, 10);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetByPostAsync_WithInvalidPageSize_ShouldReturnEmpty()
    {
        // Act
        var result = await _commentService.GetByPostAsync(1, 1, 0);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetByPostAsync_ShouldReturnComments()
    {
        // Arrange
        var user = TestDataFactory.CreateUser(1);
        var comments = new List<Comment>
        {
            new Comment 
            { 
                comment_id = 1, 
                post_id = 1, 
                user_id = 1, 
                content = "Comment 1",
                created_at = DateTime.UtcNow,
                User = user
            },
            new Comment 
            { 
                comment_id = 2, 
                post_id = 1, 
                user_id = 1, 
                content = "Comment 2",
                created_at = DateTime.UtcNow.AddMinutes(-5),
                User = user
            }
        };
        var queryable = AsyncQueryableHelper.BuildMockDbSet(comments);

        _commentRepositoryMock.Setup(r => r.Query())
            .Returns(queryable);

        // Act
        var result = await _commentService.GetByPostAsync(1, 1, 10);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
    }

    #endregion

    #region GetCountForPostAsync Tests

    [Fact]
    public async Task GetCountForPostAsync_ShouldReturnCorrectCount()
    {
        // Arrange
        var comments = new List<Comment>
        {
            TestDataFactory.CreateComment(1, 1, 1),
            TestDataFactory.CreateComment(2, 1, 2),
            TestDataFactory.CreateComment(3, 1, 3)
        };
        var queryable = AsyncQueryableHelper.BuildMockDbSet(comments);

        _commentRepositoryMock.Setup(r => r.Query())
            .Returns(queryable);

        // Act
        var result = await _commentService.GetCountForPostAsync(1);

        // Assert
        result.Should().Be(3);
    }

    #endregion
}

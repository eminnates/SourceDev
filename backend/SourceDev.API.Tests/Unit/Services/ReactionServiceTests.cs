using Microsoft.Extensions.Logging;
using Moq;
using SourceDev.API.Models.Entities;
using SourceDev.API.Repositories;
using SourceDev.API.Services;
using SourceDev.API.Tests.Helpers;
using System.Linq.Expressions;

namespace SourceDev.API.Tests.Unit.Services;

public class ReactionServiceTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IPostRepository> _postRepositoryMock;
    private readonly Mock<IRepository<Reaction>> _reactionRepositoryMock;
    private readonly Mock<ILogger<ReactionService>> _loggerMock;
    private readonly ReactionService _reactionService;

    public ReactionServiceTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _postRepositoryMock = new Mock<IPostRepository>();
        _reactionRepositoryMock = new Mock<IRepository<Reaction>>();
        _loggerMock = new Mock<ILogger<ReactionService>>();

        _unitOfWorkMock.Setup(u => u.Posts).Returns(_postRepositoryMock.Object);
        _unitOfWorkMock.Setup(u => u.Reactions).Returns(_reactionRepositoryMock.Object);

        _reactionService = new ReactionService(_unitOfWorkMock.Object, _loggerMock.Object);
    }

    #region ToggleReactionAsync Tests

    [Fact]
    public async Task ToggleReactionAsync_WithEmptyReactionType_ShouldThrowArgumentException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(
            () => _reactionService.ToggleReactionAsync(1, 1, ""));
    }

    [Fact]
    public async Task ToggleReactionAsync_WhenPostNotFound_ShouldReturnFalse()
    {
        // Arrange
        _postRepositoryMock.Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((Post?)null);

        // Act
        var result = await _reactionService.ToggleReactionAsync(999, 1, "like");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task ToggleReactionAsync_WhenReactionExists_ShouldRemoveReaction()
    {
        // Arrange
        var post = TestDataFactory.CreatePost(1);
        var existingReaction = TestDataFactory.CreateReaction(1, 1, "like");

        _postRepositoryMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(post);
        _reactionRepositoryMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Reaction, bool>>>()))
            .ReturnsAsync(existingReaction);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _reactionService.ToggleReactionAsync(1, 1, "like");

        // Assert
        result.Should().BeTrue();
        _reactionRepositoryMock.Verify(r => r.Delete(existingReaction), Times.Once);
    }

    [Fact]
    public async Task ToggleReactionAsync_WhenReactionNotExists_ShouldAddReaction()
    {
        // Arrange
        var post = TestDataFactory.CreatePost(1);

        _postRepositoryMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(post);
        _reactionRepositoryMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Reaction, bool>>>()))
            .ReturnsAsync((Reaction?)null);
        _reactionRepositoryMock.Setup(r => r.AddAsync(It.IsAny<Reaction>()))
            .ReturnsAsync((Reaction r) => r);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _reactionService.ToggleReactionAsync(1, 1, "like");

        // Assert
        result.Should().BeTrue();
        _reactionRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Reaction>()), Times.Once);
    }

    [Fact]
    public async Task ToggleReactionAsync_ShouldNormalizeReactionType()
    {
        // Arrange
        var post = TestDataFactory.CreatePost(1);

        _postRepositoryMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(post);
        _reactionRepositoryMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Reaction, bool>>>()))
            .ReturnsAsync((Reaction?)null);
        _reactionRepositoryMock.Setup(r => r.AddAsync(It.IsAny<Reaction>()))
            .ReturnsAsync((Reaction r) => r);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _reactionService.ToggleReactionAsync(1, 1, "  LIKE  ");

        // Assert
        result.Should().BeTrue();
        _reactionRepositoryMock.Verify(r => r.AddAsync(It.Is<Reaction>(
            reaction => reaction.reaction_type == "like")), Times.Once);
    }

    #endregion

    #region RemoveReactionAsync Tests

    [Fact]
    public async Task RemoveReactionAsync_WhenReactionNotFound_ShouldReturnFalse()
    {
        // Arrange
        _reactionRepositoryMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Reaction, bool>>>()))
            .ReturnsAsync((Reaction?)null);

        // Act
        var result = await _reactionService.RemoveReactionAsync(1, 1, "like");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task RemoveReactionAsync_WhenReactionExists_ShouldRemoveAndReturnTrue()
    {
        // Arrange
        var reaction = TestDataFactory.CreateReaction(1, 1, "like");

        _reactionRepositoryMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Reaction, bool>>>()))
            .ReturnsAsync(reaction);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _reactionService.RemoveReactionAsync(1, 1, "like");

        // Assert
        result.Should().BeTrue();
        _reactionRepositoryMock.Verify(r => r.Delete(reaction), Times.Once);
    }

    #endregion

    #region GetSummaryAsync Tests

    [Fact]
    public async Task GetSummaryAsync_WhenPostNotFound_ShouldReturnEmptyDictionary()
    {
        // Arrange
        _postRepositoryMock.Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((Post?)null);

        // Act
        var result = await _reactionService.GetSummaryAsync(999);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetSummaryAsync_WhenPostExists_ShouldReturnGroupedReactions()
    {
        // Arrange
        var post = TestDataFactory.CreatePost(1);
        var reactions = new List<Reaction>
        {
            TestDataFactory.CreateReaction(1, 1, "like"),
            TestDataFactory.CreateReaction(1, 2, "like"),
            TestDataFactory.CreateReaction(1, 3, "love")
        };
        var queryable = AsyncQueryableHelper.BuildMockDbSet(reactions);

        _postRepositoryMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(post);
        _reactionRepositoryMock.Setup(r => r.Query())
            .Returns(queryable);

        // Act
        var result = await _reactionService.GetSummaryAsync(1);

        // Assert
        result.Should().NotBeNull();
        result.Should().ContainKey("like");
        result.Should().ContainKey("love");
        result["like"].Should().Be(2);
        result["love"].Should().Be(1);
    }

    #endregion
}

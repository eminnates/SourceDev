using Microsoft.Extensions.Logging;
using Moq;
using SourceDev.API.Models.Entities;
using SourceDev.API.Repositories;
using SourceDev.API.Services;
using SourceDev.API.Tests.Helpers;
using System.Linq.Expressions;

namespace SourceDev.API.Tests.Unit.Services;

public class FollowServiceTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IRepository<UserFollow>> _userFollowRepositoryMock;
    private readonly Mock<ILogger<FollowService>> _loggerMock;
    private readonly FollowService _followService;

    public FollowServiceTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _userRepositoryMock = new Mock<IUserRepository>();
        _userFollowRepositoryMock = new Mock<IRepository<UserFollow>>();
        _loggerMock = new Mock<ILogger<FollowService>>();

        _unitOfWorkMock.Setup(u => u.Users).Returns(_userRepositoryMock.Object);
        _unitOfWorkMock.Setup(u => u.UserFollows).Returns(_userFollowRepositoryMock.Object);

        _followService = new FollowService(_unitOfWorkMock.Object, _loggerMock.Object);
    }

    #region FollowUserAsync Tests

    [Fact]
    public async Task FollowUserAsync_WhenUserTriesToFollowSelf_ShouldReturnFalse()
    {
        // Arrange
        var userId = 1;

        // Act
        var result = await _followService.FollowUserAsync(userId, userId);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task FollowUserAsync_WhenTargetUserNotFound_ShouldReturnFalse()
    {
        // Arrange
        _userRepositoryMock.Setup(r => r.GetByIdAsync(2))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _followService.FollowUserAsync(1, 2);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task FollowUserAsync_WhenAlreadyFollowing_ShouldReturnTrue()
    {
        // Arrange
        var targetUser = TestDataFactory.CreateUser(2);
        var existingFollow = TestDataFactory.CreateUserFollow(1, 2);

        _userRepositoryMock.Setup(r => r.GetByIdAsync(2))
            .ReturnsAsync(targetUser);
        _userFollowRepositoryMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<UserFollow, bool>>>()))
            .ReturnsAsync(existingFollow);

        // Act
        var result = await _followService.FollowUserAsync(1, 2);

        // Assert
        result.Should().BeTrue();
        _userFollowRepositoryMock.Verify(r => r.AddAsync(It.IsAny<UserFollow>()), Times.Never);
    }

    [Fact]
    public async Task FollowUserAsync_WhenNotFollowing_ShouldAddFollowAndReturnTrue()
    {
        // Arrange
        var targetUser = TestDataFactory.CreateUser(2);

        _userRepositoryMock.Setup(r => r.GetByIdAsync(2))
            .ReturnsAsync(targetUser);
        _userFollowRepositoryMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<UserFollow, bool>>>()))
            .ReturnsAsync((UserFollow?)null);
        _userFollowRepositoryMock.Setup(r => r.AddAsync(It.IsAny<UserFollow>()))
            .ReturnsAsync((UserFollow uf) => uf);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _followService.FollowUserAsync(1, 2);

        // Assert
        result.Should().BeTrue();
        _userFollowRepositoryMock.Verify(r => r.AddAsync(It.IsAny<UserFollow>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    #endregion

    #region UnfollowUserAsync Tests

    [Fact]
    public async Task UnfollowUserAsync_WhenNotFollowing_ShouldReturnFalse()
    {
        // Arrange
        _userFollowRepositoryMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<UserFollow, bool>>>()))
            .ReturnsAsync((UserFollow?)null);

        // Act
        var result = await _followService.UnfollowUserAsync(1, 2);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task UnfollowUserAsync_WhenFollowing_ShouldRemoveFollowAndReturnTrue()
    {
        // Arrange
        var existingFollow = TestDataFactory.CreateUserFollow(1, 2);

        _userFollowRepositoryMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<UserFollow, bool>>>()))
            .ReturnsAsync(existingFollow);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _followService.UnfollowUserAsync(1, 2);

        // Assert
        result.Should().BeTrue();
        _userFollowRepositoryMock.Verify(r => r.Delete(existingFollow), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    #endregion

    #region IsFollowingAsync Tests

    [Fact]
    public async Task IsFollowingAsync_WhenFollowing_ShouldReturnTrue()
    {
        // Arrange
        var follows = new List<UserFollow>
        {
            TestDataFactory.CreateUserFollow(1, 2)
        };
        var queryable = AsyncQueryableHelper.BuildMockDbSet(follows);

        _userFollowRepositoryMock.Setup(r => r.Query())
            .Returns(queryable);

        // Act
        var result = await _followService.IsFollowingAsync(1, 2);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task IsFollowingAsync_WhenNotFollowing_ShouldReturnFalse()
    {
        // Arrange
        var follows = new List<UserFollow>();
        var queryable = AsyncQueryableHelper.BuildMockDbSet(follows);

        _userFollowRepositoryMock.Setup(r => r.Query())
            .Returns(queryable);

        // Act
        var result = await _followService.IsFollowingAsync(1, 2);

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region GetFollowersCountAsync Tests

    [Fact]
    public async Task GetFollowersCountAsync_ShouldReturnCorrectCount()
    {
        // Arrange
        var follows = new List<UserFollow>
        {
            TestDataFactory.CreateUserFollow(2, 1),
            TestDataFactory.CreateUserFollow(3, 1),
            TestDataFactory.CreateUserFollow(4, 1)
        };
        var queryable = AsyncQueryableHelper.BuildMockDbSet(follows);

        _userFollowRepositoryMock.Setup(r => r.Query())
            .Returns(queryable);

        // Act
        var result = await _followService.GetFollowersCountAsync(1);

        // Assert
        result.Should().Be(3);
    }

    #endregion

    #region GetFollowingCountAsync Tests

    [Fact]
    public async Task GetFollowingCountAsync_ShouldReturnCorrectCount()
    {
        // Arrange
        var follows = new List<UserFollow>
        {
            TestDataFactory.CreateUserFollow(1, 2),
            TestDataFactory.CreateUserFollow(1, 3)
        };
        var queryable = AsyncQueryableHelper.BuildMockDbSet(follows);

        _userFollowRepositoryMock.Setup(r => r.Query())
            .Returns(queryable);

        // Act
        var result = await _followService.GetFollowingCountAsync(1);

        // Assert
        result.Should().Be(2);
    }

    #endregion
}

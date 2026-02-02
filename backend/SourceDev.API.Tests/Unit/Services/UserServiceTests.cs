using Moq;
using SourceDev.API.DTOs.User;
using SourceDev.API.Models.Entities;
using SourceDev.API.Repositories;
using SourceDev.API.Services;
using SourceDev.API.Tests.Helpers;

namespace SourceDev.API.Tests.Unit.Services;

public class UserServiceTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly UserService _userService;

    public UserServiceTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _userRepositoryMock = new Mock<IUserRepository>();

        _unitOfWorkMock.Setup(u => u.Users).Returns(_userRepositoryMock.Object);

        _userService = new UserService(_unitOfWorkMock.Object);
    }

    #region GetUserByIdAsync Tests

    [Fact]
    public async Task GetUserByIdAsync_WhenUserExists_ShouldReturnUser()
    {
        // Arrange
        var user = TestDataFactory.CreateUser(1);

        _userRepositoryMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(user);

        // Act
        var result = await _userService.GetUserByIdAsync(1);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(1);
    }

    [Fact]
    public async Task GetUserByIdAsync_WhenUserNotExists_ShouldReturnNull()
    {
        // Arrange
        _userRepositoryMock.Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _userService.GetUserByIdAsync(999);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region GetUserDtoByIdAsync Tests

    [Fact]
    public async Task GetUserDtoByIdAsync_WhenUserExists_ShouldReturnUserDto()
    {
        // Arrange
        var user = TestDataFactory.CreateUser(1);

        _userRepositoryMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(user);
        _userRepositoryMock.Setup(r => r.GetFollowersCountAsync(1))
            .ReturnsAsync(100);
        _userRepositoryMock.Setup(r => r.GetFollowingCountAsync(1))
            .ReturnsAsync(50);

        // Act
        var result = await _userService.GetUserDtoByIdAsync(1);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(1);
        result.FollowersCount.Should().Be(100);
        result.FollowingCount.Should().Be(50);
    }

    [Fact]
    public async Task GetUserDtoByIdAsync_WhenUserNotExists_ShouldReturnNull()
    {
        // Arrange
        _userRepositoryMock.Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _userService.GetUserDtoByIdAsync(999);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetUserDtoByIdAsync_WhenUserIsDeleted_ShouldReturnNull()
    {
        // Arrange
        var user = TestDataFactory.CreateUser(1);
        user.on_deleted = true;

        _userRepositoryMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(user);

        // Act
        var result = await _userService.GetUserDtoByIdAsync(1);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region GetUserByEmailAsync Tests

    [Fact]
    public async Task GetUserByEmailAsync_WhenUserExists_ShouldReturnUser()
    {
        // Arrange
        var user = TestDataFactory.CreateUser(1);
        var email = user.Email!;

        _userRepositoryMock.Setup(r => r.GetByEmailAsync(email))
            .ReturnsAsync(user);

        // Act
        var result = await _userService.GetUserByEmailAsync(email);

        // Assert
        result.Should().NotBeNull();
        result!.Email.Should().Be(email);
    }

    [Fact]
    public async Task GetUserByEmailAsync_WhenUserNotExists_ShouldReturnNull()
    {
        // Arrange
        _userRepositoryMock.Setup(r => r.GetByEmailAsync("nonexistent@test.com"))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _userService.GetUserByEmailAsync("nonexistent@test.com");

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region GetUserByUsernameAsync Tests

    [Fact]
    public async Task GetUserByUsernameAsync_WhenUserExists_ShouldReturnUser()
    {
        // Arrange
        var user = TestDataFactory.CreateUser(1);
        var username = user.UserName!;

        _userRepositoryMock.Setup(r => r.GetByUsernameAsync(username))
            .ReturnsAsync(user);

        // Act
        var result = await _userService.GetUserByUsernameAsync(username);

        // Assert
        result.Should().NotBeNull();
        result!.UserName.Should().Be(username);
    }

    [Fact]
    public async Task GetUserByUsernameAsync_WhenUserNotExists_ShouldReturnNull()
    {
        // Arrange
        _userRepositoryMock.Setup(r => r.GetByUsernameAsync("nonexistent"))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _userService.GetUserByUsernameAsync("nonexistent");

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region GetAllUsersAsync Tests

    [Fact]
    public async Task GetAllUsersAsync_ShouldReturnUserDtos()
    {
        // Arrange
        var users = new List<User>
        {
            TestDataFactory.CreateUser(1),
            TestDataFactory.CreateUser(2)
        };

        _userRepositoryMock.Setup(r => r.GetAllUsersPagedAsync(1, 20))
            .ReturnsAsync(users);
        _userRepositoryMock.Setup(r => r.GetFollowersCountsAsync(It.IsAny<List<int>>()))
            .ReturnsAsync(new Dictionary<int, int> { { 1, 10 }, { 2, 20 } });
        _userRepositoryMock.Setup(r => r.GetFollowingCountsAsync(It.IsAny<List<int>>()))
            .ReturnsAsync(new Dictionary<int, int> { { 1, 5 }, { 2, 10 } });

        // Act
        var result = await _userService.GetAllUsersAsync(1, 20);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetAllUsersAsync_WhenNoUsers_ShouldReturnEmpty()
    {
        // Arrange
        _userRepositoryMock.Setup(r => r.GetAllUsersPagedAsync(1, 20))
            .ReturnsAsync(new List<User>());

        // Act
        var result = await _userService.GetAllUsersAsync(1, 20);

        // Assert
        result.Should().BeEmpty();
    }

    #endregion

    #region GetActiveUsersAsync Tests

    [Fact]
    public async Task GetActiveUsersAsync_ShouldReturnActiveUsers()
    {
        // Arrange
        var users = new List<User>
        {
            TestDataFactory.CreateUser(1),
            TestDataFactory.CreateUser(2)
        };

        _userRepositoryMock.Setup(r => r.GetActiveUsersAsync())
            .ReturnsAsync(users);
        _userRepositoryMock.Setup(r => r.GetFollowersCountsAsync(It.IsAny<List<int>>()))
            .ReturnsAsync(new Dictionary<int, int> { { 1, 10 }, { 2, 20 } });
        _userRepositoryMock.Setup(r => r.GetFollowingCountsAsync(It.IsAny<List<int>>()))
            .ReturnsAsync(new Dictionary<int, int> { { 1, 5 }, { 2, 10 } });

        // Act
        var result = await _userService.GetActiveUsersAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
    }

    #endregion

    #region SearchUsersAsync Tests

    [Fact]
    public async Task SearchUsersAsync_WithValidTerm_ShouldReturnMatchingUsers()
    {
        // Arrange
        var users = new List<User>
        {
            TestDataFactory.CreateUser(1)
        };

        _userRepositoryMock.Setup(r => r.SearchUsersByDisplayNameAsync("test"))
            .ReturnsAsync(users);
        _userRepositoryMock.Setup(r => r.GetFollowersCountsAsync(It.IsAny<List<int>>()))
            .ReturnsAsync(new Dictionary<int, int> { { 1, 10 } });
        _userRepositoryMock.Setup(r => r.GetFollowingCountsAsync(It.IsAny<List<int>>()))
            .ReturnsAsync(new Dictionary<int, int> { { 1, 5 } });

        // Act
        var result = await _userService.SearchUsersAsync("test");

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(1);
    }

    [Fact]
    public async Task SearchUsersAsync_WithNoMatches_ShouldReturnEmpty()
    {
        // Arrange
        _userRepositoryMock.Setup(r => r.SearchUsersByDisplayNameAsync("nonexistent"))
            .ReturnsAsync(new List<User>());

        // Act
        var result = await _userService.SearchUsersAsync("nonexistent");

        // Assert
        result.Should().BeEmpty();
    }

    #endregion

    #region IsEmailAvailableAsync Tests

    [Fact]
    public async Task IsEmailAvailableAsync_WhenAvailable_ShouldReturnTrue()
    {
        // Arrange
        _userRepositoryMock.Setup(r => r.IsEmailExistsAsync("available@test.com"))
            .ReturnsAsync(false);

        // Act
        var result = await _userService.IsEmailAvailableAsync("available@test.com");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task IsEmailAvailableAsync_WhenNotAvailable_ShouldReturnFalse()
    {
        // Arrange
        _userRepositoryMock.Setup(r => r.IsEmailExistsAsync("taken@test.com"))
            .ReturnsAsync(true);

        // Act
        var result = await _userService.IsEmailAvailableAsync("taken@test.com");

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region IsUsernameAvailableAsync Tests

    [Fact]
    public async Task IsUsernameAvailableAsync_WhenAvailable_ShouldReturnTrue()
    {
        // Arrange
        _userRepositoryMock.Setup(r => r.IsUsernameExistsAsync("availableuser"))
            .ReturnsAsync(false);

        // Act
        var result = await _userService.IsUsernameAvailableAsync("availableuser");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task IsUsernameAvailableAsync_WhenNotAvailable_ShouldReturnFalse()
    {
        // Arrange
        _userRepositoryMock.Setup(r => r.IsUsernameExistsAsync("takenuser"))
            .ReturnsAsync(true);

        // Act
        var result = await _userService.IsUsernameAvailableAsync("takenuser");

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region DeleteUserAsync Tests

    [Fact]
    public async Task DeleteUserAsync_WhenUserExists_ShouldMarkAsDeletedAndReturnTrue()
    {
        // Arrange
        var user = TestDataFactory.CreateUser(1);

        _userRepositoryMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(user);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _userService.DeleteUserAsync(1);

        // Assert
        result.Should().BeTrue();
        user.on_deleted.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteUserAsync_WhenUserNotExists_ShouldReturnFalse()
    {
        // Arrange
        _userRepositoryMock.Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _userService.DeleteUserAsync(999);

        // Assert
        result.Should().BeFalse();
    }

    #endregion
}

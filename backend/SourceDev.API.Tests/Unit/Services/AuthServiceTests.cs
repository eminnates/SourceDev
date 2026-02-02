using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using SourceDev.API.DTOs.Auth;
using SourceDev.API.Models.Entities;
using SourceDev.API.Repositories;
using SourceDev.API.Services;
using SourceDev.API.Tests.Helpers;

namespace SourceDev.API.Tests.Unit.Services;

public class AuthServiceTests : IDisposable
{
    private readonly Mock<UserManager<User>> _userManagerMock;
    private readonly Mock<SignInManager<User>> _signInManagerMock;
    private readonly Mock<IConfiguration> _configMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<ITokenBlacklistService> _tokenBlacklistServiceMock;
    private readonly Mock<ILogger<AuthService>> _loggerMock;
    private readonly AuthService _authService;
    private readonly string _originalJwtSecret;
    private readonly string _originalJwtIssuer;
    private readonly string _originalJwtAudience;
    private readonly string _originalJwtExpiration;

    public AuthServiceTests()
    {
        // Save original environment variables
        _originalJwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? "";
        _originalJwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "";
        _originalJwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "";
        _originalJwtExpiration = Environment.GetEnvironmentVariable("JWT_EXPIRATION_MINUTES") ?? "";

        // Set test environment variables
        Environment.SetEnvironmentVariable("JWT_SECRET_KEY", "TestSecretKeyThatIsAtLeast32Characters!");
        Environment.SetEnvironmentVariable("JWT_ISSUER", "TestIssuer");
        Environment.SetEnvironmentVariable("JWT_AUDIENCE", "TestAudience");
        Environment.SetEnvironmentVariable("JWT_EXPIRATION_MINUTES", "60");

        // Mock UserManager
        var userStoreMock = new Mock<IUserStore<User>>();
        _userManagerMock = new Mock<UserManager<User>>(
            userStoreMock.Object,
            null!, null!, null!, null!, null!, null!, null!, null!);

        // Mock SignInManager
        var contextAccessorMock = new Mock<IHttpContextAccessor>();
        var userClaimsPrincipalFactoryMock = new Mock<IUserClaimsPrincipalFactory<User>>();
        _signInManagerMock = new Mock<SignInManager<User>>(
            _userManagerMock.Object,
            contextAccessorMock.Object,
            userClaimsPrincipalFactoryMock.Object,
            null!, null!, null!, null!);

        _configMock = new Mock<IConfiguration>();
        _mapperMock = new Mock<IMapper>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _tokenBlacklistServiceMock = new Mock<ITokenBlacklistService>();
        _loggerMock = new Mock<ILogger<AuthService>>();

        _authService = new AuthService(
            _userManagerMock.Object,
            _configMock.Object,
            _signInManagerMock.Object,
            _mapperMock.Object,
            _unitOfWorkMock.Object,
            _tokenBlacklistServiceMock.Object,
            _loggerMock.Object
        );
    }

    public void Dispose()
    {
        // Restore original environment variables
        Environment.SetEnvironmentVariable("JWT_SECRET_KEY", 
            string.IsNullOrEmpty(_originalJwtSecret) ? null : _originalJwtSecret);
        Environment.SetEnvironmentVariable("JWT_ISSUER", 
            string.IsNullOrEmpty(_originalJwtIssuer) ? null : _originalJwtIssuer);
        Environment.SetEnvironmentVariable("JWT_AUDIENCE", 
            string.IsNullOrEmpty(_originalJwtAudience) ? null : _originalJwtAudience);
        Environment.SetEnvironmentVariable("JWT_EXPIRATION_MINUTES", 
            string.IsNullOrEmpty(_originalJwtExpiration) ? null : _originalJwtExpiration);
    }

    #region RegisterAsync Tests

    [Fact]
    public async Task RegisterAsync_WhenEmailAlreadyExists_ShouldReturnFailure()
    {
        // Arrange
        var dto = TestDataFactory.CreateRegisterDto();
        var existingUser = TestDataFactory.CreateUser();

        _userManagerMock.Setup(m => m.FindByEmailAsync(dto.Email))
            .ReturnsAsync(existingUser);

        // Act
        var result = await _authService.RegisterAsync(dto);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Be("Email already registered");
    }

    [Fact]
    public async Task RegisterAsync_WhenUsernameAlreadyExists_ShouldReturnFailure()
    {
        // Arrange
        var dto = TestDataFactory.CreateRegisterDto();
        var existingUser = TestDataFactory.CreateUser();

        _userManagerMock.Setup(m => m.FindByEmailAsync(dto.Email))
            .ReturnsAsync((User?)null);
        _userManagerMock.Setup(m => m.FindByNameAsync(dto.Username))
            .ReturnsAsync(existingUser);

        // Act
        var result = await _authService.RegisterAsync(dto);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Be("Username already taken");
    }

    [Fact]
    public async Task RegisterAsync_WhenUserCreationFails_ShouldReturnFailure()
    {
        // Arrange
        var dto = TestDataFactory.CreateRegisterDto();
        var identityErrors = new List<IdentityError>
        {
            new IdentityError { Code = "PasswordTooShort", Description = "Password is too short" }
        };

        _userManagerMock.Setup(m => m.FindByEmailAsync(dto.Email))
            .ReturnsAsync((User?)null);
        _userManagerMock.Setup(m => m.FindByNameAsync(dto.Username))
            .ReturnsAsync((User?)null);
        _userManagerMock.Setup(m => m.CreateAsync(It.IsAny<User>(), dto.Password))
            .ReturnsAsync(IdentityResult.Failed(identityErrors.ToArray()));

        // Act
        var result = await _authService.RegisterAsync(dto);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("Password is too short");
    }

    [Fact]
    public async Task RegisterAsync_WhenValid_ShouldReturnSuccessWithToken()
    {
        // Arrange
        var dto = TestDataFactory.CreateRegisterDto();
        User? capturedUser = null;
        var expectedUserInfo = new UserInfoDto
        {
            Id = 1,
            Username = dto.Username,
            Email = dto.Email,
            DisplayName = dto.DisplayName
        };

        _userManagerMock.Setup(m => m.FindByEmailAsync(dto.Email))
            .ReturnsAsync((User?)null);
        _userManagerMock.Setup(m => m.FindByNameAsync(dto.Username))
            .ReturnsAsync((User?)null);
        _userManagerMock.Setup(m => m.CreateAsync(It.IsAny<User>(), dto.Password))
            .Callback<User, string>((u, p) => { capturedUser = u; u.Id = 1; })
            .ReturnsAsync(IdentityResult.Success);
        _userManagerMock.Setup(m => m.GetRolesAsync(It.IsAny<User>()))
            .ReturnsAsync(new List<string>());
        _mapperMock.Setup(m => m.Map<UserInfoDto>(It.IsAny<User>()))
            .Returns(expectedUserInfo);

        // Act
        var result = await _authService.RegisterAsync(dto);

        // Assert
        result.Success.Should().BeTrue();
        result.Token.Should().NotBeNullOrEmpty();
        result.User.Should().NotBeNull();
        result.User!.Username.Should().Be(dto.Username);
    }

    #endregion

    #region LoginAsync Tests

    [Fact]
    public async Task LoginAsync_WhenUserNotFound_ShouldReturnFailure()
    {
        // Arrange
        var dto = TestDataFactory.CreateLoginDto();

        _userManagerMock.Setup(m => m.FindByEmailAsync(dto.EmailOrUsername))
            .ReturnsAsync((User?)null);
        _userManagerMock.Setup(m => m.FindByNameAsync(dto.EmailOrUsername))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _authService.LoginAsync(dto);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Be("Invalid credentials"); // Service returns this for not found
    }

    [Fact]
    public async Task LoginAsync_WhenUserDeleted_ShouldReturnFailure()
    {
        // Arrange
        var dto = TestDataFactory.CreateLoginDto();
        var user = TestDataFactory.CreateUser();
        user.on_deleted = true;

        _userManagerMock.Setup(m => m.FindByEmailAsync(dto.EmailOrUsername))
            .ReturnsAsync(user);

        // Act
        var result = await _authService.LoginAsync(dto);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Be("Account has been deleted");
    }

    [Fact]
    public async Task LoginAsync_WhenPasswordInvalid_ShouldReturnFailure()
    {
        // Arrange
        var dto = TestDataFactory.CreateLoginDto();
        var user = TestDataFactory.CreateUser();

        _userManagerMock.Setup(m => m.FindByEmailAsync(dto.EmailOrUsername))
            .ReturnsAsync(user);
        _signInManagerMock.Setup(m => m.CheckPasswordSignInAsync(user, dto.Password, false))
            .ReturnsAsync(SignInResult.Failed);

        // Act
        var result = await _authService.LoginAsync(dto);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Be("Invalid credentials");
    }

    [Fact]
    public async Task LoginAsync_WhenValid_ShouldReturnSuccessWithToken()
    {
        // Arrange
        var dto = TestDataFactory.CreateLoginDto();
        var user = TestDataFactory.CreateUser();
        user.Id = 123;
        var expectedUserInfo = new UserInfoDto
        {
            Id = 123,
            Username = user.UserName!,
            Email = user.Email!,
            DisplayName = user.display_name
        };

        _userManagerMock.Setup(m => m.FindByEmailAsync(dto.EmailOrUsername))
            .ReturnsAsync(user);
        _signInManagerMock.Setup(m => m.CheckPasswordSignInAsync(user, dto.Password, false))
            .ReturnsAsync(SignInResult.Success);
        _userManagerMock.Setup(m => m.GetRolesAsync(user))
            .ReturnsAsync(new List<string> { "User" });
        _mapperMock.Setup(m => m.Map<UserInfoDto>(user))
            .Returns(expectedUserInfo);

        // Act
        var result = await _authService.LoginAsync(dto);

        // Assert
        result.Success.Should().BeTrue();
        result.Token.Should().NotBeNullOrEmpty();
        result.User.Should().NotBeNull();
        result.User!.Id.Should().Be(123);
    }

    #endregion

    #region ChangePasswordAsync Tests

    [Fact]
    public async Task ChangePasswordAsync_WhenUserNotFound_ShouldReturnFailure()
    {
        // Arrange
        var dto = TestDataFactory.CreateChangePasswordDto("oldPass123!", "newPass123!");

        _userManagerMock.Setup(m => m.FindByIdAsync("999"))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _authService.ChangePasswordAsync(999, dto);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Be("User not found");
    }

    [Fact]
    public async Task ChangePasswordAsync_WhenCurrentPasswordWrong_ShouldReturnFailure()
    {
        // Arrange
        var dto = TestDataFactory.CreateChangePasswordDto("wrongPass123!", "newPass123!");
        var user = TestDataFactory.CreateUser();
        user.Id = 1;

        _userManagerMock.Setup(m => m.FindByIdAsync("1"))
            .ReturnsAsync(user);
        _userManagerMock.Setup(m => m.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword))
            .ReturnsAsync(IdentityResult.Failed(
                new IdentityError { Description = "Incorrect current password" }));

        // Act
        var result = await _authService.ChangePasswordAsync(1, dto);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("Incorrect current password");
    }

    [Fact]
    public async Task ChangePasswordAsync_WhenValid_ShouldReturnSuccess()
    {
        // Arrange
        var dto = TestDataFactory.CreateChangePasswordDto("oldPass123!", "newPass123!");
        var user = TestDataFactory.CreateUser();
        user.Id = 1;

        _userManagerMock.Setup(m => m.FindByIdAsync("1"))
            .ReturnsAsync(user);
        _userManagerMock.Setup(m => m.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        var result = await _authService.ChangePasswordAsync(1, dto);

        // Assert
        result.Success.Should().BeTrue();
        result.Message.Should().Be("Password changed successfully");
    }

    #endregion

    #region ValidateTokenAsync Tests

    [Fact]
    public async Task ValidateTokenAsync_WhenTokenIsBlacklisted_ShouldReturnFalse()
    {
        // Arrange
        var token = "blacklisted-token";
        _tokenBlacklistServiceMock.Setup(s => s.IsBlacklistedAsync(token))
            .ReturnsAsync(true);

        // Act
        var result = await _authService.ValidateTokenAsync(token);

        // Assert
        result.Should().BeFalse();
    }

    #endregion
}

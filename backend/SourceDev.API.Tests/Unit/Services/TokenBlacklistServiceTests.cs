using SourceDev.API.Services;

namespace SourceDev.API.Tests.Unit.Services;

public class TokenBlacklistServiceTests
{
    private readonly TokenBlacklistService _tokenBlacklistService;

    public TokenBlacklistServiceTests()
    {
        _tokenBlacklistService = new TokenBlacklistService();
    }

    #region AddToBlacklistAsync Tests

    [Fact]
    public async Task AddToBlacklistAsync_ShouldAddTokenToBlacklist()
    {
        // Arrange
        var token = "test-token-" + Guid.NewGuid();

        // Act
        await _tokenBlacklistService.AddToBlacklistAsync(token);
        var isBlacklisted = await _tokenBlacklistService.IsBlacklistedAsync(token);

        // Assert
        isBlacklisted.Should().BeTrue();
    }

    [Fact]
    public async Task AddToBlacklistAsync_WithSameTokenTwice_ShouldNotThrow()
    {
        // Arrange
        var token = "duplicate-token-" + Guid.NewGuid();

        // Act
        await _tokenBlacklistService.AddToBlacklistAsync(token);
        var act = () => _tokenBlacklistService.AddToBlacklistAsync(token);

        // Assert
        await act.Should().NotThrowAsync();
    }

    #endregion

    #region IsBlacklistedAsync Tests

    [Fact]
    public async Task IsBlacklistedAsync_WhenTokenNotBlacklisted_ShouldReturnFalse()
    {
        // Arrange
        var token = "non-existent-token-" + Guid.NewGuid();

        // Act
        var result = await _tokenBlacklistService.IsBlacklistedAsync(token);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task IsBlacklistedAsync_WhenTokenBlacklisted_ShouldReturnTrue()
    {
        // Arrange
        var token = "blacklisted-token-" + Guid.NewGuid();
        await _tokenBlacklistService.AddToBlacklistAsync(token);

        // Act
        var result = await _tokenBlacklistService.IsBlacklistedAsync(token);

        // Assert
        result.Should().BeTrue();
    }

    #endregion

    #region RemoveExpiredTokensAsync Tests

    [Fact]
    public async Task RemoveExpiredTokensAsync_ShouldCompleteWithoutException()
    {
        // Arrange
        var token = "test-cleanup-token-" + Guid.NewGuid();
        await _tokenBlacklistService.AddToBlacklistAsync(token);

        // Act
        var act = () => _tokenBlacklistService.RemoveExpiredTokensAsync();

        // Assert
        await act.Should().NotThrowAsync();
    }

    #endregion
}

using Microsoft.Extensions.Logging;
using Moq;
using SourceDev.API.DTOs.Tag;
using SourceDev.API.Models.Entities;
using SourceDev.API.Repositories;
using SourceDev.API.Services;
using SourceDev.API.Tests.Helpers;

namespace SourceDev.API.Tests.Unit.Services;

public class TagServiceTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<ITagRepository> _tagRepositoryMock;
    private readonly Mock<IRepository<PostTag>> _postTagRepositoryMock;
    private readonly Mock<ILogger<TagService>> _loggerMock;
    private readonly TagService _tagService;

    public TagServiceTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _tagRepositoryMock = new Mock<ITagRepository>();
        _postTagRepositoryMock = new Mock<IRepository<PostTag>>();
        _loggerMock = new Mock<ILogger<TagService>>();

        _unitOfWorkMock.Setup(u => u.Tags).Returns(_tagRepositoryMock.Object);
        _unitOfWorkMock.Setup(u => u.PostTags).Returns(_postTagRepositoryMock.Object);

        _tagService = new TagService(_unitOfWorkMock.Object, _loggerMock.Object);
    }

    #region GetAllTagsAsync Tests

    [Fact]
    public async Task GetAllTagsAsync_ShouldReturnAllTags()
    {
        // Arrange
        var tags = new List<Tag>
        {
            TestDataFactory.CreateTag(1, "csharp"),
            TestDataFactory.CreateTag(2, "dotnet")
        };

        _tagRepositoryMock.Setup(r => r.GetAllTagsAsync())
            .ReturnsAsync(tags);
        _postTagRepositoryMock.Setup(r => r.CountAsync(It.IsAny<System.Linq.Expressions.Expression<Func<PostTag, bool>>>()))
            .ReturnsAsync(5);

        // Act
        var result = await _tagService.GetAllTagsAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.First().Name.Should().Be("csharp");
    }

    [Fact]
    public async Task GetAllTagsAsync_WhenNoTags_ShouldReturnEmptyList()
    {
        // Arrange
        _tagRepositoryMock.Setup(r => r.GetAllTagsAsync())
            .ReturnsAsync(new List<Tag>());

        // Act
        var result = await _tagService.GetAllTagsAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    #endregion

    #region GetPopularTagsAsync Tests

    [Fact]
    public async Task GetPopularTagsAsync_ShouldReturnPopularTags()
    {
        // Arrange
        var tags = new List<Tag>
        {
            TestDataFactory.CreateTag(1, "javascript"),
            TestDataFactory.CreateTag(2, "python")
        };

        _tagRepositoryMock.Setup(r => r.GetPopularTagsAsync(20))
            .ReturnsAsync(tags);
        _postTagRepositoryMock.Setup(r => r.CountAsync(It.IsAny<System.Linq.Expressions.Expression<Func<PostTag, bool>>>()))
            .ReturnsAsync(10);

        // Act
        var result = await _tagService.GetPopularTagsAsync(20);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetPopularTagsAsync_WithCustomLimit_ShouldRespectLimit()
    {
        // Arrange
        var tags = new List<Tag> { TestDataFactory.CreateTag(1, "react") };

        _tagRepositoryMock.Setup(r => r.GetPopularTagsAsync(5))
            .ReturnsAsync(tags);
        _postTagRepositoryMock.Setup(r => r.CountAsync(It.IsAny<System.Linq.Expressions.Expression<Func<PostTag, bool>>>()))
            .ReturnsAsync(15);

        // Act
        var result = await _tagService.GetPopularTagsAsync(5);

        // Assert
        _tagRepositoryMock.Verify(r => r.GetPopularTagsAsync(5), Times.Once);
    }

    #endregion

    #region SearchTagsAsync Tests

    [Fact]
    public async Task SearchTagsAsync_ShouldReturnMatchingTags()
    {
        // Arrange
        var tags = new List<Tag>
        {
            TestDataFactory.CreateTag(1, "typescript")
        };

        _tagRepositoryMock.Setup(r => r.SearchByNameAsync("type", 10))
            .ReturnsAsync(tags);
        _postTagRepositoryMock.Setup(r => r.CountAsync(It.IsAny<System.Linq.Expressions.Expression<Func<PostTag, bool>>>()))
            .ReturnsAsync(8);

        // Act
        var result = await _tagService.SearchTagsAsync("type", 10);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(1);
        result.First().Name.Should().Be("typescript");
    }

    [Fact]
    public async Task SearchTagsAsync_WithEmptyQuery_ShouldReturnEmptyList()
    {
        // Act
        var result = await _tagService.SearchTagsAsync("", 10);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task SearchTagsAsync_WithWhitespaceQuery_ShouldReturnEmptyList()
    {
        // Act
        var result = await _tagService.SearchTagsAsync("   ", 10);

        // Assert
        result.Should().BeEmpty();
    }

    #endregion

    #region GetTagByIdAsync Tests

    [Fact]
    public async Task GetTagByIdAsync_WhenTagExists_ShouldReturnTag()
    {
        // Arrange
        var tag = TestDataFactory.CreateTag(1, "aspnetcore");

        _tagRepositoryMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(tag);
        _postTagRepositoryMock.Setup(r => r.CountAsync(It.IsAny<System.Linq.Expressions.Expression<Func<PostTag, bool>>>()))
            .ReturnsAsync(25);

        // Act
        var result = await _tagService.GetTagByIdAsync(1);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(1);
        result.Name.Should().Be("aspnetcore");
        result.PostCount.Should().Be(25);
    }

    [Fact]
    public async Task GetTagByIdAsync_WhenTagNotExists_ShouldReturnNull()
    {
        // Arrange
        _tagRepositoryMock.Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((Tag?)null);

        // Act
        var result = await _tagService.GetTagByIdAsync(999);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region GetTagByNameAsync Tests

    [Fact]
    public async Task GetTagByNameAsync_WhenTagExists_ShouldReturnTag()
    {
        // Arrange
        var tag = TestDataFactory.CreateTag(1, "blazor");

        _tagRepositoryMock.Setup(r => r.GetByNameAsync("blazor"))
            .ReturnsAsync(tag);
        _postTagRepositoryMock.Setup(r => r.CountAsync(It.IsAny<System.Linq.Expressions.Expression<Func<PostTag, bool>>>()))
            .ReturnsAsync(12);

        // Act
        var result = await _tagService.GetTagByNameAsync("blazor");

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be("blazor");
    }

    [Fact]
    public async Task GetTagByNameAsync_WhenTagNotExists_ShouldReturnNull()
    {
        // Arrange
        _tagRepositoryMock.Setup(r => r.GetByNameAsync("nonexistent"))
            .ReturnsAsync((Tag?)null);

        // Act
        var result = await _tagService.GetTagByNameAsync("nonexistent");

        // Assert
        result.Should().BeNull();
    }

    #endregion
}

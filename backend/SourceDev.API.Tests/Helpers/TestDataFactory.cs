using Bogus;
using SourceDev.API.DTOs.Auth;
using SourceDev.API.DTOs.Comment;
using SourceDev.API.DTOs.Post;
using SourceDev.API.DTOs.Tag;
using SourceDev.API.DTOs.User;
using SourceDev.API.Models.Entities;

namespace SourceDev.API.Tests.Helpers;

public static class TestDataFactory
{
    private static readonly Faker _faker = new("en");

    public static User CreateUser(int? id = null)
    {
        return new User
        {
            Id = id ?? _faker.Random.Int(1, 10000),
            UserName = _faker.Internet.UserName(),
            Email = _faker.Internet.Email(),
            display_name = _faker.Name.FullName(),
            bio = _faker.Lorem.Sentence(),
            profile_img_url = _faker.Internet.Avatar(),
            created_at = DateTime.UtcNow.AddDays(-_faker.Random.Int(1, 365)),
            on_deleted = false,
            EmailConfirmed = true
        };
    }

    public static RegisterDto CreateRegisterDto()
    {
        return new RegisterDto
        {
            Username = _faker.Internet.UserName(),
            Email = _faker.Internet.Email(),
            Password = _faker.Internet.Password(12, false, "\\w", "A1!"),
            DisplayName = _faker.Name.FullName(),
            Bio = _faker.Lorem.Sentence()
        };
    }

    public static LoginDto CreateLoginDto(string? emailOrUsername = null, string? password = null)
    {
        return new LoginDto
        {
            EmailOrUsername = emailOrUsername ?? _faker.Internet.Email(),
            Password = password ?? _faker.Internet.Password(12, false, "\\w", "A1!"),
            RememberMe = false
        };
    }

    public static Post CreatePost(int? id = null, int? authorId = null, bool published = true)
    {
        var post = new Post
        {
            post_id = id ?? _faker.Random.Int(1, 10000),
            user_id = authorId ?? _faker.Random.Int(1, 1000),
            default_language_code = "tr",
            cover_img_url = _faker.Image.PicsumUrl(),
            status = published,
            published_at = published ? DateTime.UtcNow.AddDays(-_faker.Random.Int(0, 30)) : null,
            created_at = DateTime.UtcNow.AddDays(-_faker.Random.Int(30, 100)),
            updated_at = DateTime.UtcNow.AddDays(-_faker.Random.Int(0, 30)),
            likes_count = _faker.Random.Int(0, 1000),
            bookmarks_count = _faker.Random.Int(0, 500),
            view_count = _faker.Random.Long(0, 50000),
            reading_time_minutes = _faker.Random.Long(1, 20)
        };

        post.Translations.Add(new PostTranslation
        {
            post_id = post.post_id,
            language_code = "tr",
            title = _faker.Lorem.Sentence(),
            slug = _faker.Lorem.Slug(),
            content_markdown = _faker.Lorem.Paragraphs(3)
        });

        return post;
    }

    public static CreatePostDto CreateCreatePostDto(bool publishNow = true)
    {
        return new CreatePostDto
        {
            Translations = new List<PostTranslationInputDto>
            {
                new PostTranslationInputDto
                {
                    LanguageCode = "tr",
                    Title = _faker.Lorem.Sentence(),
                    Content = _faker.Lorem.Paragraphs(3)
                }
            },
            DefaultLanguageCode = "tr",
            CoverImageUrl = _faker.Image.PicsumUrl(),
            PublishNow = publishNow,
            Tags = new List<string> { _faker.Lorem.Word(), _faker.Lorem.Word() }
        };
    }

    public static PostDto CreatePostDto(int? id = null, int? authorId = null)
    {
        return new PostDto
        {
            Id = id ?? _faker.Random.Int(1, 10000),
            Title = _faker.Lorem.Sentence(),
            Slug = _faker.Lorem.Slug(),
            ContentMarkdown = _faker.Lorem.Paragraphs(3),
            CoverImageUrl = _faker.Image.PicsumUrl(),
            AuthorId = authorId ?? _faker.Random.Int(1, 1000),
            AuthorDisplayName = _faker.Name.FullName(),
            Status = true,
            PublishedAt = DateTime.UtcNow.AddDays(-_faker.Random.Int(0, 30)),
            CreatedAt = DateTime.UtcNow.AddDays(-_faker.Random.Int(30, 100)),
            UpdatedAt = DateTime.UtcNow.AddDays(-_faker.Random.Int(0, 30)),
            LikesCount = _faker.Random.Int(0, 1000),
            CommentsCount = _faker.Random.Int(0, 100),
            ViewCount = _faker.Random.Long(0, 50000),
            BookmarksCount = _faker.Random.Int(0, 500),
            ReadingTimeMinutes = _faker.Random.Long(1, 20),
            Tags = new List<string> { _faker.Lorem.Word(), _faker.Lorem.Word() }
        };
    }

    public static Tag CreateTag(int? id = null, string? name = null)
    {
        return new Tag
        {
            tag_id = id ?? _faker.Random.Int(1, 1000),
            name = name ?? _faker.Lorem.Word().ToLower()
        };
    }

    public static TagDto CreateTagDto(int? id = null, string? name = null)
    {
        return new TagDto
        {
            Id = id ?? _faker.Random.Int(1, 1000),
            Name = name ?? _faker.Lorem.Word().ToLower(),
            PostCount = _faker.Random.Int(0, 100)
        };
    }

    public static Comment CreateComment(int? id = null, int? postId = null, int? userId = null)
    {
        return new Comment
        {
            comment_id = id ?? _faker.Random.Int(1, 10000),
            post_id = postId ?? _faker.Random.Int(1, 1000),
            user_id = userId ?? _faker.Random.Int(1, 1000),
            content = _faker.Lorem.Paragraph(),
            created_at = DateTime.UtcNow.AddHours(-_faker.Random.Int(1, 720)),
            parent_comment_id = null
        };
    }

    public static CommentDto CreateCommentDto(int? id = null, int? postId = null, int? userId = null)
    {
        return new CommentDto
        {
            Id = id ?? _faker.Random.Int(1, 10000),
            PostId = postId ?? _faker.Random.Int(1, 1000),
            UserId = userId ?? _faker.Random.Int(1, 1000),
            UserDisplayName = _faker.Name.FullName(),
            Content = _faker.Lorem.Paragraph(),
            CreatedAt = DateTime.UtcNow.AddHours(-_faker.Random.Int(1, 720)),
            ParentCommentId = null,
            RepliesCount = _faker.Random.Int(0, 20)
        };
    }

    public static UserFollow CreateUserFollow(int followerId, int followingId)
    {
        return new UserFollow
        {
            follower_id = followerId,
            following_id = followingId,
            created_at = DateTime.UtcNow.AddDays(-_faker.Random.Int(1, 90))
        };
    }

    public static Reaction CreateReaction(int postId, int userId, string type = "like")
    {
        return new Reaction
        {
            post_id = postId,
            user_id = userId,
            reaction_type = type,
            created_at = DateTime.UtcNow.AddHours(-_faker.Random.Int(1, 168))
        };
    }

    public static ChangePasswordDto CreateChangePasswordDto(string currentPassword, string newPassword)
    {
        return new ChangePasswordDto
        {
            CurrentPassword = currentPassword,
            NewPassword = newPassword,
            ConfirmPassword = newPassword
        };
    }

    public static UserDto CreateUserDto(int? id = null)
    {
        return new UserDto
        {
            Id = id ?? _faker.Random.Int(1, 10000),
            Username = _faker.Internet.UserName(),
            Email = _faker.Internet.Email(),
            DisplayName = _faker.Name.FullName(),
            Bio = _faker.Lorem.Sentence(),
            ProfileImageUrl = _faker.Internet.Avatar(),
            CreatedAt = DateTime.UtcNow.AddDays(-_faker.Random.Int(1, 365)),
            FollowersCount = _faker.Random.Int(0, 1000),
            FollowingCount = _faker.Random.Int(0, 500)
        };
    }
}

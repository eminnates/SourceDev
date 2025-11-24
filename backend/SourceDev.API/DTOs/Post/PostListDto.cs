namespace SourceDev.API.DTOs.Post
{
    public class PostListDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Excerpt { get; set; } = string.Empty;
        public int Likes { get; set; }
        public long Views { get; set; }
        public int Bookmarks { get; set; }
        public DateTime? PublishedAt { get; set; }
        public string AuthorDisplayName { get; set; } = string.Empty;
        public string? CoverImageUrl { get; set; }
        public int CommentsCount { get; set; } = 0;
        public int BookmarksCount { get; set; } = 0;
        public long ReadingTimeMinutes { get; set; } = 0;
        public bool LikedByCurrentUser { get; set; }
        public bool BookmarkedByCurrentUser { get; set; }
        public Dictionary<string, int> ReactionTypes { get; set; } = new();
        public List<string> UserReactions { get; set; } = new(); // Current user's reactions (types)
        public List<string> Tags { get; set; } = new();

    }
}

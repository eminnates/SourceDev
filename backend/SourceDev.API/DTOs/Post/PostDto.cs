namespace SourceDev.API.DTOs.Post
{
    public class PostDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string ContentMarkdown { get; set; } = string.Empty;
        public string? CoverImageUrl { get; set; }
        public int AuthorId { get; set; }
        public string AuthorDisplayName { get; set; } = string.Empty;
        public bool Status { get; set; }  // true = published, false = draft
        public DateTime? PublishedAt { get; set; } // draft ise null
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int LikesCount { get; set; }
        public int CommentsCount { get; set; }
        public long ViewCount { get; set; }
        public int BookmarksCount { get; set; }
        public long ReadingTimeMinutes { get; set; } = 0;
        public bool LikedByCurrentUser { get; set; }
        public bool BookmarkedByCurrentUser { get; set; }
        public Dictionary<string, int> ReactionTypes { get; set; } = new();
        public List<string> UserReactions { get; set; } = new();
        public List<string> Tags { get; set; } = new();
    }
}

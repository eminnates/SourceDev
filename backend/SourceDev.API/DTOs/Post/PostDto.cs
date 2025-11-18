namespace SourceDev.API.DTOs.Post
{
    public class PostDto
    {
        public int Id { get; set; }
        public string Slug { get; set; } = string.Empty;
        public string ContentMarkdown { get; set; } = string.Empty;
        public string? CoverImageUrl { get; set; }
        public int AuthorId { get; set; }
        public string AuthorDisplayName { get; set; } = string.Empty;
        public bool Status { get; set; }  // true = published, false = draft
        public DateTime PublishedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int LikesCount { get; set; }
        public long ViewCount { get; set; }
        public int BookmarksCount { get; set; }
        public bool LikedByCurrentUser { get; set; }
        public bool BookmarkedByCurrentUser { get; set; }
    }
}

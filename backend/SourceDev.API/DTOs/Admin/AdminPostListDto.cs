namespace SourceDev.API.DTOs.Admin
{
    public class AdminPostListDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Excerpt { get; set; } = string.Empty;
        public int AuthorId { get; set; }
        public string AuthorDisplayName { get; set; } = string.Empty;
        public bool Status { get; set; }
        public int Likes { get; set; }
        public long Views { get; set; }
        public int Bookmarks { get; set; }
        public DateTime? PublishedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<string> Tags { get; set; } = new();
    }
}
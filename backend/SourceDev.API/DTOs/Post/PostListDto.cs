namespace SourceDev.API.DTOs.Post
{
    public class PostListDto
    {
        public int Id { get; set; }
        public string Slug { get; set; } = string.Empty;
        public string Excerpt { get; set; } = string.Empty;
        public int Likes { get; set; }
        public long Views { get; set; }
        public int Bookmarks { get; set; }
        public DateTime PublishedAt { get; set; }
        public string AuthorDisplayName { get; set; } = string.Empty;
    }
}

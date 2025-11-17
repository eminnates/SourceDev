namespace SourceDev.API.DTOs.Post
{
    public class CreatePostDto
    {
        public string Slug { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? CoverImageUrl { get; set; }
        public bool PublishNow { get; set; } = true;
    }
}

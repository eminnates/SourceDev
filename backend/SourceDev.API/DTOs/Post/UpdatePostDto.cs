namespace SourceDev.API.DTOs.Post
{
    public class UpdatePostDto
    {
        public string? Title { get; set; }
        public string? Content { get; set; }
        public string? CoverImageUrl { get; set; }
        public bool? PublishNow { get; set; }
        public Dictionary<string, int> ReactionTypes { get; set; } = new();
        public List<string> Tags { get; set; } = new();
    }
}

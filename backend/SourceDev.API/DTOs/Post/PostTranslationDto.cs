namespace SourceDev.API.DTOs.Post
{
    public class PostTranslationDto
    {
        public string LanguageCode { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string ContentMarkdown { get; set; } = string.Empty;
    }
}

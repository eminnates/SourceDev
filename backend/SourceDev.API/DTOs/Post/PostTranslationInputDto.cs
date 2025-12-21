namespace SourceDev.API.DTOs.Post
{
    public class PostTranslationInputDto
    {
        public string LanguageCode { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }
}

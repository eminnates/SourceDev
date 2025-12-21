namespace SourceDev.API.DTOs.Post
{
    public class UpdatePostDto
    {
        public List<PostTranslationInputDto>? Translations { get; set; }
        public string? DefaultLanguageCode { get; set; }
        public string? CoverImageUrl { get; set; }
        public bool? PublishNow { get; set; }
        public List<string>? Tags { get; set; }
    }
}

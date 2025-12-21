namespace SourceDev.API.DTOs.Post
{
    public class CreatePostDto
    {
        public List<PostTranslationInputDto> Translations { get; set; } = new List<PostTranslationInputDto>();
        public string DefaultLanguageCode { get; set; } = "tr";
        public string? CoverImageUrl { get; set; }
        public bool PublishNow { get; set; } = true;
        public List<string> Tags { get; set; } = new List<string>(); // Tag isimleri
        public List<int> TagIds { get; set; } = new List<int>(); // Tag ID'leri
    }
}

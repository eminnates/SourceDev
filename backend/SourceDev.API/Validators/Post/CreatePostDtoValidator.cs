using FluentValidation;
using SourceDev.API.DTOs.Post;

namespace SourceDev.API.Validators.Post
{
    public class CreatePostDtoValidator : AbstractValidator<CreatePostDto>
    {
        public CreatePostDtoValidator()
        {
            RuleFor(x => x.Translations)
                .NotEmpty().WithMessage("At least one translation is required");

            RuleForEach(x => x.Translations).ChildRules(translation => {
                translation.RuleFor(x => x.Title)
                    .NotEmpty().WithMessage("Title is required")
                    .Length(5, 200).WithMessage("Title must be between 5 and 200 characters");

                translation.RuleFor(x => x.Content)
                    .NotEmpty().WithMessage("Content is required")
                    .MinimumLength(50).WithMessage("Content must be at least 50 characters")
                    .MaximumLength(30000).WithMessage("Content cannot exceed 30,000 characters");
                
                translation.RuleFor(x => x.LanguageCode)
                    .NotEmpty().WithMessage("Language code is required")
                    .Length(2, 5).WithMessage("Language code must be between 2 and 5 characters");
            });

            RuleFor(x => x.CoverImageUrl)
                .Must(BeAValidUrl).When(x => !string.IsNullOrEmpty(x.CoverImageUrl))
                .WithMessage("Cover image URL must be a valid URL");

            RuleFor(x => x.Tags)
                .Must(tags => tags == null || tags.Count <= 5)
                .WithMessage("Maximum 5 tags allowed")
                .Must(tags => tags == null || tags.All(tag => !string.IsNullOrWhiteSpace(tag) && tag.Length <= 50))
                .WithMessage("Each tag must not be empty and cannot exceed 50 characters");
        }

        private bool BeAValidUrl(string? url)
        {
            if (string.IsNullOrEmpty(url)) return true;
            return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
                   && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
        }
    }
}

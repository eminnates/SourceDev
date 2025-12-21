using FluentValidation;
using SourceDev.API.DTOs.Post;

namespace SourceDev.API.Validators.Post
{
    public class UpdatePostDtoValidator : AbstractValidator<UpdatePostDto>
    {
        public UpdatePostDtoValidator()
        {
            RuleForEach(x => x.Translations).ChildRules(translation => {
                translation.RuleFor(x => x.Title)
                    .MaximumLength(200).WithMessage("Title cannot exceed 200 characters")
                    .When(x => !string.IsNullOrEmpty(x.Title));

                translation.RuleFor(x => x.Content)
                    .MinimumLength(50).WithMessage("Content must be at least 50 characters")
                    .MaximumLength(30000).WithMessage("Content cannot exceed 30,000 characters")
                    .When(x => !string.IsNullOrEmpty(x.Content));
            });

            RuleFor(x => x.CoverImageUrl)
                .Must(BeAValidUrl).When(x => !string.IsNullOrEmpty(x.CoverImageUrl))
                .WithMessage("Cover image URL must be a valid URL");

            RuleFor(x => x.Tags)
                .Must(tags => tags == null || tags.Count <= 5).WithMessage("You can add up to 5 tags");
        }

        private bool BeAValidUrl(string? url)
        {
            if (string.IsNullOrEmpty(url)) return true;
            return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
                   && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
        }
    }
}

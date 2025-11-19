using FluentValidation;
using SourceDev.API.DTOs.Post;

namespace SourceDev.API.Validators.Post
{
    public class UpdatePostDtoValidator : AbstractValidator<UpdatePostDto>
    {
        public UpdatePostDtoValidator()
        {
            RuleFor(x => x.Content)
                .NotEmpty().WithMessage("Content is required")
                .MinimumLength(50).WithMessage("Content must be at least 50 characters")
                .MaximumLength(30000).WithMessage("Content cannot exceed 30,000 characters");

            RuleFor(x => x.CoverImageUrl)
                .Must(BeAValidUrl).When(x => !string.IsNullOrEmpty(x.CoverImageUrl))
                .WithMessage("Cover image URL must be a valid URL");
        }

        private bool BeAValidUrl(string? url)
        {
            if (string.IsNullOrEmpty(url)) return true;
            return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
                   && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
        }
    }
}

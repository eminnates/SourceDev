using FluentValidation;
using SourceDev.API.DTOs.Auth;

namespace SourceDev.API.Validators.User
{
    public class UpdateProfileDtoValidator : AbstractValidator<UpdateProfileDto>
    {
        public UpdateProfileDtoValidator()
        {
            RuleFor(x => x.DisplayName)
                .NotEmpty().WithMessage("Display name is required")
                .Length(2, 50).WithMessage("Display name must be between 2 and 50 characters");

            RuleFor(x => x.Bio)
                .MaximumLength(200).WithMessage("Bio cannot exceed 200 characters");

            RuleFor(x => x.ProfileImageUrl)
                .Must(BeAValidUrl).When(x => !string.IsNullOrEmpty(x.ProfileImageUrl))
                .WithMessage("Profile image URL must be a valid URL");
        }

        private bool BeAValidUrl(string? url)
        {
            if (string.IsNullOrEmpty(url)) return true;
            return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
                   && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
        }
    }
}

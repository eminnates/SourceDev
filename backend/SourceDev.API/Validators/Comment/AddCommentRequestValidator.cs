using FluentValidation;
using SourceDev.API.DTOs.Comment;

namespace SourceDev.API.Validators.Comment
{
    public class AddCommentRequestValidator : AbstractValidator<AddCommentRequest>
    {
        public AddCommentRequestValidator()
        {
            RuleFor(x => x.Content)
                .NotEmpty().WithMessage("Content is required")
                .MaximumLength(3000).WithMessage("Content cannot exceed 3000 characters");
        }
    }
}

using FluentValidation;
using SourceDev.API.DTOs.Admin;

namespace SourceDev.API.Validators.Admin
{
    public class AdminPostUpdateDtoValidator : AbstractValidator<AdminPostUpdateDto>
    {
        public AdminPostUpdateDtoValidator()
        {
            // Status is a bool, so it's always present (true or false). 
            // No specific validation needed unless we want to enforce something specific.
            // But since it was [Required], it just means it must be in the payload (which is handled by deserializer usually).
            // However, for bool, it's value type, so it defaults to false.
            // If we want to ensure it was sent, we might need nullable bool.
            // But the DTO has `bool Status`.
            // So I'll just leave it empty or add a dummy rule if needed, but actually we don't need a rule for bool.
            // Wait, if I remove [Required], is there any impact?
            // [Required] on bool is redundant unless it's bool?.
            // So I will just create the validator class to be consistent, maybe empty or with a comment.
        }
    }
}

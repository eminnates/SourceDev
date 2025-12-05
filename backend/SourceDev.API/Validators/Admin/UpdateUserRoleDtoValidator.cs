using FluentValidation;
using SourceDev.API.DTOs.Admin;

namespace SourceDev.API.Validators.Admin
{
    public class UpdateUserRoleDtoValidator : AbstractValidator<UpdateUserRoleDto>
    {
        public UpdateUserRoleDtoValidator()
        {
            RuleFor(x => x.Role)
                .NotEmpty().WithMessage("Role is required")
                .Must(role => new[] { "Admin", "User", "Moderator" }.Contains(role))
                .WithMessage("Role must be one of: Admin, User, Moderator");
        }
    }
}

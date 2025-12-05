namespace SourceDev.API.DTOs.Admin
{
    public class UpdateUserRoleDto
    {
        public string Role { get; set; } = string.Empty; // "Admin", "User", "Moderator"
    }
}
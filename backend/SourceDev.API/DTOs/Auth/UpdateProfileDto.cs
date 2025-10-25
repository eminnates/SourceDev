using System.ComponentModel.DataAnnotations;

namespace SourceDev.API.DTOs.Auth
{
    public class UpdateProfileDto
    {
        [Required(ErrorMessage = "Display name is required")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Display name must be between 2 and 50 characters")]
        public string DisplayName { get; set; } = string.Empty;

        [StringLength(200, ErrorMessage = "Bio cannot exceed 200 characters")]
        public string? Bio { get; set; }

        [Url(ErrorMessage = "Invalid URL format")]
        public string? ProfileImageUrl { get; set; }
    }
}

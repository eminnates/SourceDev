using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace SourceDev.API.Models.Entities
{
    public class User : IdentityUser<int>
    {
        [Required]
        [MaxLength(50)]
        public string display_name { get; set; } = string.Empty;

        [MaxLength(200)]
        public string bio { get; set; } = string.Empty;
        
        public string? profile_img_url { get; set; }
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
        
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        
        public bool on_deleted { get; set; } = false;
    }
}

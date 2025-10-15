using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace SourceDev.API.Model
{
    public class User
    {
        [Key]
        public int user_id { get; set; }

        [Required]
        [MaxLength(30)]
        public string username { get; set; } = String.Empty;

        [Required]
        [EmailAddress]
        public string email { get; set; } = String.Empty;

        [Required]
        [MaxLength(256)]
        public string password_hash { get; set; } = String.Empty;

        [Required]
        [MaxLength(50)]

        public string display_name { get; set; } = String.Empty;

        [MaxLength(200)]
        public string bio { get; set; } = String.Empty;
        public string? profile_img_url { get; set; }
        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        public bool on_deleted { get; set; } = false;







    }
}

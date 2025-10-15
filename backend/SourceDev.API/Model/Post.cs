using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SourceDev.API.Model
{
    public class Post
    {
        [Key]
        public int post_id { get; set; }

        [ForeignKey("User")]
        public int user_id { get; set; }

        [Required]
        [MaxLength(100)]
        public string slug { get; set; } = String.Empty;

        [Required]
        [MaxLength(3000)]
        public string content_markdown { get; set; } = String.Empty;

        public string? cover_img_url { get; set; }

        [Required]
        public bool status { get; set; } = true; // true = published, false = draft


        public Int64 view_count { get; set; } = 0;
        public Int64 reading_time_minutes { get; set; } = 0;
        public int likes_count { get; set; } = 0;
        public int bookmarks_count { get; set; } = 0;

        public DateTime published_at { get; set; } = DateTime.UtcNow;
        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;

        public User? User { get; set; }
    }
}

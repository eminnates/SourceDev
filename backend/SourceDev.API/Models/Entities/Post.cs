using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SourceDev.API.Models.Entities
{
    public class Post
    {
        [Key]
        public int post_id { get; set; }

        [ForeignKey("User")]
        public int user_id { get; set; }

        [Required]
        [MaxLength(100)]
        public string slug { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)] 
        public string title { get; set; } = string.Empty;

        [Required]
        [MaxLength(30000)] // character limit expanded
        public string content_markdown { get; set; } = string.Empty;

        public string? cover_img_url { get; set; }

        [Required]
        public bool status { get; set; } = true; // true = published, false = draft


        public long view_count { get; set; } = 0;
        public long reading_time_minutes { get; set; } = 0;
        public int likes_count { get; set; } = 0;
        public int comments_count { get; set; } = 0;
        public int bookmarks_count { get; set; } = 0;
    

        // Nullable: null when draft, value when published
        public DateTime? published_at { get; set; }
        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        public DateTime? deleted_at { get; set; }

        // Navigation properties
        [JsonIgnore]
        public User? User { get; set; }
        [JsonIgnore]
        public ICollection<Reaction> Reactions { get; set; } = new List<Reaction>();
        [JsonIgnore]
        public ICollection<PostTag> PostTags { get; set; } = new List<PostTag>();
        [JsonIgnore]
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    }
}

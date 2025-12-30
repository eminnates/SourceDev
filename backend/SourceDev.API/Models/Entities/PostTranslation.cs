using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SourceDev.API.Models.Entities
{
    public class PostTranslation
    {
        // ID removed from primary key - now using composite key (post_id, language_code)
        // Keeping id property for backward compatibility during migration, but it's not the primary key
        public int id { get; set; }

        [ForeignKey("Post")]
        public int post_id { get; set; }
        [JsonIgnore]
        public Post Post { get; set; }

        [Required]
        [MaxLength(5)]
        public string language_code { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string title { get; set; } = string.Empty;

        [Required]
        [MaxLength(30000)]
        public string content_markdown { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string slug { get; set; } = string.Empty;
    }
}

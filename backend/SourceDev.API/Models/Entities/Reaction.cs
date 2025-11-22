using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SourceDev.API.Models.Entities
{
    public class Reaction
    {
        [Key]
        public int reaction_id { get; set; }

        [ForeignKey("User")]
        public int user_id { get; set; }

        [ForeignKey("Post")]
        public int post_id { get; set; }
        [Required]
        [MaxLength(20)]
        public string reaction_type { get; set; } = string.Empty;
        public DateTime created_at { get; set; } = DateTime.Now;

        [JsonIgnore]
        public User? User { get; set; }

        [JsonIgnore]
        public Post? Post { get; set; }

    }
}

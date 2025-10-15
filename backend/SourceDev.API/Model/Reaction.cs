using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SourceDev.API.Model
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

        public User User { get; set; }

        public Post Post { get; set; }

    }
}

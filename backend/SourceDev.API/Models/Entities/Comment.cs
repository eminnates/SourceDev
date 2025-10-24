using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;

namespace SourceDev.API.Models.Entities
{
    public class Comment
    {
        [Key]
        public int comment_id { get; set; }

        [ForeignKey("Post")]
        public int post_id { get; set; }

        [ForeignKey("User")]
        public int user_id { get; set; }

        public int? parent_comment_id { get; set; }

        [Required]
        [MaxLength(3000)]
        public string content {  get; set; } = string.Empty;
        public DateTime created_at {  get; set; } = DateTime.UtcNow;

        public Post Post { get; set; }
        public User User { get; set; }


    }
}

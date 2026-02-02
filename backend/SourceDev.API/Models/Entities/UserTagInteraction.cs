using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SourceDev.API.Models.Entities
{
    /// <summary>
    /// Tracks user interactions with tags for personalized feed
    /// </summary>
    public class UserTagInteraction
    {
        [Key]
        public int id { get; set; }

        [ForeignKey("User")]
        public int user_id { get; set; }

        [ForeignKey("Tag")]
        public int tag_id { get; set; }

        /// <summary>
        /// Weighted interaction score (likes=3, comments=2, bookmarks=2, views=0.1)
        /// </summary>
        public double interaction_score { get; set; } = 0;

        /// <summary>
        /// Total number of interactions with this tag
        /// </summary>
        public int interaction_count { get; set; } = 0;

        public DateTime last_interaction_at { get; set; } = DateTime.UtcNow;
        public DateTime created_at { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User? User { get; set; }
        public Tag? Tag { get; set; }
    }
}

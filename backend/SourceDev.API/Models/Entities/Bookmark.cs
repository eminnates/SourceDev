using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SourceDev.API.Models.Entities
{
    public class Bookmark
    {
        [ForeignKey("User")]
        public int user_id { get; set; }

        [ForeignKey("Post")]
        public int post_id { get; set; }
        public DateTime created_at { get; set; } = DateTime.Now;
        public User User { get; set; }
        public Post Post { get; set; }

    }
}

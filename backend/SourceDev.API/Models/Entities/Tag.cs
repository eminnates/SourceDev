using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SourceDev.API.Models.Entities
{
    public class Tag
    {
        [Key]
        public int tag_id { get; set; }

        [Required]
        [MaxLength(50)]
        public string name { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string slug { get; set; } = string.Empty;

        public int post_count { get; set; } = 0;

        // Navigation property
        public ICollection<PostTag> PostTags { get; set; } = new List<PostTag>();
    }
}
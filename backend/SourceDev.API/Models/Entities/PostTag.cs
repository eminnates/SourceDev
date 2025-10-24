using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SourceDev.API.Models.Entities
{
    public class PostTag
    {
        [ForeignKey("Tag")]
        public int tag_id { get; set; }
        [ForeignKey("Post")]
        public int post_id { get; set; }

        public Post Post { get; set; }
        public Tag Tag { get; set; }
    }
}

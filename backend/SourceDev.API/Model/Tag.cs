using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SourceDev.API.Model
{
    public class Tag
    {
        [Key]
        public int tag_id { get; set; }
        [Required]
        [MaxLength(50)]
        public string name { get; set; } = string.Empty;


    }
}

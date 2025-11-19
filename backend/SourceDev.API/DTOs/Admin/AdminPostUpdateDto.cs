using System.ComponentModel.DataAnnotations;

namespace SourceDev.API.DTOs.Admin
{
    public class AdminPostUpdateDto
    {
        [Required]
        public bool Status { get; set; } // true = published, false = draft
    }
}
using System.ComponentModel.DataAnnotations;

namespace SourceDev.API.DTOs.Comment
{
    public class AddCommentRequest
    {
        [Required(ErrorMessage = "Content is required")]
        [MaxLength(3000, ErrorMessage = "Content cannot exceed 3000 characters")]
        public string Content { get; set; } = string.Empty;

        public int? ParentCommentId { get; set; }
    }
}


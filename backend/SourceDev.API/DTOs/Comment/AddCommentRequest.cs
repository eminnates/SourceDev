namespace SourceDev.API.DTOs.Comment
{
    public class AddCommentRequest
    {
        public string Content { get; set; } = string.Empty;

        public int? ParentCommentId { get; set; }
    }
}


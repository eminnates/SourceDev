namespace SourceDev.API.DTOs.Admin
{
    public class AdminStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalPosts { get; set; }
        public int PublishedPosts { get; set; }
        public int DraftPosts { get; set; }
        public int TotalTags { get; set; }
        public int TodayPosts { get; set; }
        public int TodayUsers { get; set; }
        public long TotalViews { get; set; }
        public int TotalLikes { get; set; }
    }
}
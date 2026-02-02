namespace SourceDev.API.Helpers
{
    /// <summary>
    /// Advanced post scoring algorithms for feed ranking
    /// </summary>
    public static class PostScoringHelper
    {
        // Z-score for 95% confidence interval (Wilson Score)
        private const double Z = 1.96;
        
        /// <summary>
        /// Trending Score - Hacker News style algorithm
        /// Best for: Posts gaining traction quickly in the last 24-48 hours
        /// Formula: (engagement_points) / (age_hours + 2)^1.8
        /// </summary>
        public static double CalculateTrendingScore(
            long viewCount, 
            int likesCount, 
            int commentsCount, 
            int bookmarksCount,
            DateTime? publishedAt)
        {
            if (!publishedAt.HasValue) return 0;
            
            var ageHours = (DateTime.UtcNow - publishedAt.Value).TotalHours;
            
            // Only consider posts from last 48 hours for trending
            if (ageHours > 48) return 0;
            
            // Weighted engagement points
            double engagementPoints = 
                likesCount * 4.0 + 
                commentsCount * 3.0 + 
                bookmarksCount * 2.0 + 
                viewCount / 100.0;
            
            // Gravity factor - posts decay over time
            double gravity = Math.Pow(ageHours + 2, 1.8);
            
            return engagementPoints / gravity;
        }

        /// <summary>
        /// Hot Score - Reddit-style algorithm
        /// Best for: Balanced mix of new and engaging content
        /// Formula: sign(engagement) × log10(max(|engagement|, 1)) + age_seconds/45000
        /// </summary>
        public static double CalculateHotScore(
            int likesCount, 
            int commentsCount, 
            int bookmarksCount,
            DateTime? publishedAt)
        {
            if (!publishedAt.HasValue) return 0;
            
            // Epoch for scoring (Jan 1, 2024)
            var epoch = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            var ageSeconds = (publishedAt.Value - epoch).TotalSeconds;
            
            // Weighted engagement
            double engagement = likesCount * 3.0 + commentsCount * 2.0 + bookmarksCount - 1;
            
            // Sign of engagement
            int sign = engagement > 0 ? 1 : engagement < 0 ? -1 : 0;
            
            // Logarithmic engagement component
            double engagementScore = sign * Math.Log10(Math.Max(Math.Abs(engagement), 1));
            
            // Time component - newer posts get higher base score
            double timeScore = ageSeconds / 45000.0;
            
            return engagementScore + timeScore;
        }

        /// <summary>
        /// Wilson Score - Statistical confidence ranking
        /// Best for: "Top" posts with reliable quality assessment
        /// Uses lower bound of Wilson confidence interval
        /// </summary>
        public static double CalculateWilsonScore(
            int likesCount,
            int totalInteractions,
            double timePenalty = 1.0)
        {
            if (totalInteractions == 0) return 0;
            
            // Proportion of positive ratings
            double p = (double)likesCount / totalInteractions;
            double n = totalInteractions;
            
            // Wilson score lower bound formula
            double numerator = p + (Z * Z) / (2 * n) - 
                              Z * Math.Sqrt((p * (1 - p) + (Z * Z) / (4 * n)) / n);
            double denominator = 1 + (Z * Z) / n;
            
            double wilson = numerator / denominator;
            
            // Apply time decay
            return wilson * timePenalty;
        }

        /// <summary>
        /// Time decay factor for Top posts
        /// </summary>
        public static double CalculateTimeDecay(DateTime? publishedAt, TimePeriod period)
        {
            if (!publishedAt.HasValue) return 0;
            
            var ageDays = (DateTime.UtcNow - publishedAt.Value).TotalDays;
            
            double periodDays = period switch
            {
                TimePeriod.Day => 1,
                TimePeriod.Week => 7,
                TimePeriod.Month => 30,
                TimePeriod.Year => 365,
                TimePeriod.All => 3650, // ~10 years, minimal decay
                _ => 30
            };
            
            // Gradual decay based on period
            return 1.0 / Math.Pow(1 + ageDays / periodDays, 0.5);
        }

        /// <summary>
        /// Personalized score based on user preferences
        /// Combines base score with affinity modifiers
        /// </summary>
        public static double CalculatePersonalizedScore(
            double baseScore,
            double tagAffinity,      // 0-1: How much user interacts with post's tags
            double authorAffinity,   // 0-1: User follows author or interacted before
            double freshnessBonus)   // 0-1: Recency bonus
        {
            // Weight factors
            const double tagWeight = 0.35;
            const double authorWeight = 0.25;
            const double freshnessWeight = 0.15;
            
            double affinityMultiplier = 1.0 + 
                tagAffinity * tagWeight + 
                authorAffinity * authorWeight + 
                freshnessBonus * freshnessWeight;
            
            return baseScore * affinityMultiplier;
        }

        /// <summary>
        /// Calculate tag affinity between user's preferred tags and post tags
        /// </summary>
        public static double CalculateTagAffinity(
            IEnumerable<int> userPreferredTagIds, 
            IEnumerable<int> postTagIds)
        {
            if (!userPreferredTagIds.Any() || !postTagIds.Any()) return 0;
            
            var userTags = userPreferredTagIds.ToHashSet();
            var postTags = postTagIds.ToList();
            
            int matchCount = postTags.Count(t => userTags.Contains(t));
            
            // Jaccard-like similarity with boost for multiple matches
            double affinity = (double)matchCount / Math.Max(postTags.Count, 1);
            
            // Bonus for posts with multiple matching tags
            if (matchCount > 1)
            {
                affinity = Math.Min(affinity * (1 + matchCount * 0.1), 1.0);
            }
            
            return affinity;
        }

        /// <summary>
        /// Calculate freshness bonus (exponential decay)
        /// </summary>
        public static double CalculateFreshnessBonus(DateTime? publishedAt, int decayHours = 72)
        {
            if (!publishedAt.HasValue) return 0;
            
            var ageHours = (DateTime.UtcNow - publishedAt.Value).TotalHours;
            
            // Exponential decay
            return Math.Exp(-ageHours / decayHours);
        }

        /// <summary>
        /// Combined engagement score (normalized)
        /// </summary>
        public static double CalculateEngagementScore(
            long viewCount, 
            int likesCount, 
            int commentsCount, 
            int bookmarksCount)
        {
            // Log scale to handle viral posts
            return Math.Log10(
                1 + 
                viewCount * 0.01 + 
                likesCount * 5 + 
                commentsCount * 3 + 
                bookmarksCount * 2
            );
        }
    }

    public enum TimePeriod
    {
        Day,
        Week,
        Month,
        Year,
        All
    }
}

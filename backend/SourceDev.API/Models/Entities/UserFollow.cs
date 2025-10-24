using System.ComponentModel.DataAnnotations;

namespace SourceDev.API.Models.Entities
{
    public class UserFollow
    {
        public int follower_id { get; set; }
        public int following_id { get; set; }
    }
}

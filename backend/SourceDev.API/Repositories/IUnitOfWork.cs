using SourceDev.API.Models.Entities;

namespace SourceDev.API.Repositories
{
    public interface IUnitOfWork : IDisposable
    {
        // Entity Repositories
        IPostRepository Posts { get; }
        IRepository<Comment> Comments { get; }
        IRepository<Bookmark> Bookmarks { get; }
        IRepository<Reaction> Reactions { get; }
        ITagRepository Tags { get; }
        IRepository<PostTag> PostTags { get; }
        IRepository<UserFollow> UserFollows { get; }
        
        // Custom Repositories
        IUserRepository Users { get; }
        
        Task<int> SaveChangesAsync();
    }
}

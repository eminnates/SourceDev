using SourceDev.API.Data.Context;
using SourceDev.API.Models.Entities;

namespace SourceDev.API.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;

        public UnitOfWork(AppDbContext context)
        {
            _context = context;
            
            // Initialize repositories
            Posts = new PostRepository(_context);
            Comments = new Repository<Comment>(_context);
            Bookmarks = new Repository<Bookmark>(_context);
            Reactions = new Repository<Reaction>(_context);
            Tags = new TagRepository(_context);
            PostTags = new Repository<PostTag>(_context);
            UserFollows = new Repository<UserFollow>(_context);
            UserTagInteractions = new Repository<UserTagInteraction>(_context);
            
            // Initialize custom repositories
            Users = new UserRepository(_context);
        }

        public IPostRepository Posts { get; private set; }
        public IRepository<Comment> Comments { get; private set; }
        public IRepository<Bookmark> Bookmarks { get; private set; }
        public IRepository<Reaction> Reactions { get; private set; }
        public ITagRepository Tags { get; private set; }
        public IRepository<PostTag> PostTags { get; private set; }
        public IRepository<UserFollow> UserFollows { get; private set; }
        public IRepository<UserTagInteraction> UserTagInteractions { get; private set; }
        
        public IUserRepository Users { get; private set; }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}

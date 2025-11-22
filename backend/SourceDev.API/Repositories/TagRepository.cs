using Microsoft.EntityFrameworkCore;
using SourceDev.API.Data.Context;
using SourceDev.API.Models.Entities;

namespace SourceDev.API.Repositories
{
    public class TagRepository : Repository<Tag>, ITagRepository
    {
        public TagRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Tag?> GetByNameAsync(string name)
        {
            return await _dbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.name == name.ToLower());
        }

        public async Task<IEnumerable<Tag>> SearchByNameAsync(string query, int limit = 10)
        {
            return await _dbSet
                .AsNoTracking()
                .Where(t => t.name.Contains(query.ToLower()))
                .OrderBy(t => t.name)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<IEnumerable<Tag>> GetPopularTagsAsync(int limit = 20)
        {
            return await _context.PostTags
                .AsNoTracking()
                .GroupBy(pt => pt.tag_id)
                .Select(g => new
                {
                    TagId = g.Key,
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Count)
                .Take(limit)
                .Join(_dbSet,
                    x => x.TagId,
                    t => t.tag_id,
                    (x, t) => t)
                .ToListAsync();
        }

        public async Task<IEnumerable<Tag>> GetAllTagsAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .OrderBy(t => t.name)
                .ToListAsync();
        }
    }
}

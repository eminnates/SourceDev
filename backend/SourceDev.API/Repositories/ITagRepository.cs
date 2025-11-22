using SourceDev.API.Models.Entities;

namespace SourceDev.API.Repositories
{
    public interface ITagRepository : IRepository<Tag>
    {
        Task<Tag?> GetByNameAsync(string name);
        Task<IEnumerable<Tag>> SearchByNameAsync(string query, int limit = 10);
        Task<IEnumerable<Tag>> GetPopularTagsAsync(int limit = 20);
        Task<IEnumerable<Tag>> GetAllTagsAsync();
    }
}

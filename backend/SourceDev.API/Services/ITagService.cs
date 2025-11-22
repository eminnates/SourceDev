using SourceDev.API.DTOs.Tag;

namespace SourceDev.API.Services
{
    public interface ITagService
    {
        Task<IEnumerable<TagDto>> GetAllTagsAsync();
        Task<IEnumerable<TagDto>> GetPopularTagsAsync(int limit = 20);
        Task<IEnumerable<TagDto>> SearchTagsAsync(string query, int limit = 10);
        Task<TagDto?> GetTagByIdAsync(int id);
        Task<TagDto?> GetTagByNameAsync(string name);
    }
}

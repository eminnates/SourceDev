using Microsoft.EntityFrameworkCore;
using SourceDev.API.DTOs.Tag;
using SourceDev.API.Repositories;

namespace SourceDev.API.Services
{
    public class TagService : ITagService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<TagService> _logger;

        public TagService(IUnitOfWork unitOfWork, ILogger<TagService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<IEnumerable<TagDto>> GetAllTagsAsync()
        {
            var tags = await _unitOfWork.Tags.GetAllTagsAsync();
            
            var tagDtos = new List<TagDto>();
            foreach (var tag in tags)
            {
                var postCount = await _unitOfWork.PostTags
                    .CountAsync(pt => pt.tag_id == tag.tag_id);
                
                tagDtos.Add(new TagDto
                {
                    Id = tag.tag_id,
                    Name = tag.name,
                    PostCount = postCount
                });
            }

            return tagDtos;
        }

        public async Task<IEnumerable<TagDto>> GetPopularTagsAsync(int limit = 20)
        {
            var tags = await _unitOfWork.Tags.GetPopularTagsAsync(limit);

            var tagDtos = new List<TagDto>();
            foreach (var tag in tags)
            {
                var postCount = await _unitOfWork.PostTags
                    .CountAsync(pt => pt.tag_id == tag.tag_id);

                tagDtos.Add(new TagDto
                {
                    Id = tag.tag_id,
                    Name = tag.name,
                    PostCount = postCount
                });
            }

            return tagDtos;
        }

        public async Task<IEnumerable<TagDto>> SearchTagsAsync(string query, int limit = 10)
        {
            if (string.IsNullOrWhiteSpace(query))
                return new List<TagDto>();

            var tags = await _unitOfWork.Tags.SearchByNameAsync(query, limit);

            var tagDtos = new List<TagDto>();
            foreach (var tag in tags)
            {
                var postCount = await _unitOfWork.PostTags
                    .CountAsync(pt => pt.tag_id == tag.tag_id);

                tagDtos.Add(new TagDto
                {
                    Id = tag.tag_id,
                    Name = tag.name,
                    PostCount = postCount
                });
            }

            return tagDtos;
        }

        public async Task<TagDto?> GetTagByIdAsync(int id)
        {
            var tag = await _unitOfWork.Tags.GetByIdAsync(id);
            if (tag == null) return null;

            var postCount = await _unitOfWork.PostTags
                .CountAsync(pt => pt.tag_id == tag.tag_id);

            return new TagDto
            {
                Id = tag.tag_id,
                Name = tag.name,
                PostCount = postCount
            };
        }

        public async Task<TagDto?> GetTagByNameAsync(string name)
        {
            var tag = await _unitOfWork.Tags.GetByNameAsync(name);
            if (tag == null) return null;

            var postCount = await _unitOfWork.PostTags
                .CountAsync(pt => pt.tag_id == tag.tag_id);

            return new TagDto
            {
                Id = tag.tag_id,
                Name = tag.name,
                PostCount = postCount
            };
        }
    }
}

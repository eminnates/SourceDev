using AutoMapper;
using SourceDev.API.DTOs.Auth;
using SourceDev.API.DTOs.User;
using SourceDev.API.DTOs.Post;
using SourceDev.API.Models.Entities;

namespace SourceDev.API.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User -> UserInfoDto
            CreateMap<User, UserInfoDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.UserName))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.DisplayName, opt => opt.MapFrom(src => src.display_name))
                .ForMember(dest => dest.Bio, opt => opt.MapFrom(src => src.bio))
                .ForMember(dest => dest.ProfileImageUrl, opt => opt.MapFrom(src => src.profile_img_url))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.created_at));

            // User -> UserDto (Takipçi sayıları ile birlikte)
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.UserName))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.DisplayName, opt => opt.MapFrom(src => src.display_name))
                .ForMember(dest => dest.Bio, opt => opt.MapFrom(src => src.bio))
                .ForMember(dest => dest.ProfileImageUrl, opt => opt.MapFrom(src => src.profile_img_url))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.created_at))
                .ForMember(dest => dest.FollowersCount, opt => opt.MapFrom(src => src.Followers.Count))
                .ForMember(dest => dest.FollowingCount, opt => opt.MapFrom(src => src.Following.Count));

            // Post mappings
            CreateMap<Post, PostDto>()
                .ForMember(d => d.Id, o => o.MapFrom(s => s.post_id))
                .ForMember(d => d.Title, o => o.MapFrom(s => s.title))
                .ForMember(d => d.Slug, o => o.MapFrom(s => s.slug))
                .ForMember(d => d.ContentMarkdown, o => o.MapFrom(s => s.content_markdown))
                .ForMember(d => d.CoverImageUrl, o => o.MapFrom(s => s.cover_img_url))
                .ForMember(d => d.AuthorId, o => o.MapFrom(s => s.user_id))
                .ForMember(d => d.AuthorDisplayName, o => o.MapFrom(s => s.User != null ? s.User.display_name : string.Empty))
                .ForMember(d => d.PublishedAt, o => o.MapFrom(s => s.published_at))
                .ForMember(d => d.CreatedAt, o => o.MapFrom(s => s.created_at))
                .ForMember(d => d.UpdatedAt, o => o.MapFrom(s => s.updated_at))
                .ForMember(d => d.LikesCount, o => o.MapFrom(s => s.likes_count))
                .ForMember(d => d.ViewCount, o => o.MapFrom(s => s.view_count))
                .ForMember(d => d.BookmarksCount, o => o.MapFrom(s => s.bookmarks_count))
                .ForMember(d => d.ReadingTimeMinutes, o => o.MapFrom(s => s.reading_time_minutes));

            CreateMap<Post, PostListDto>()
                .ForMember(d => d.Id, o => o.MapFrom(s => s.post_id))
                .ForMember(d => d.Title, o => o.MapFrom(s => s.title))
                .ForMember(d => d.Slug, o => o.MapFrom(s => s.slug))
                .ForMember(d => d.Excerpt, o => o.MapFrom(s => s.content_markdown.Length > 200 ? s.content_markdown.Substring(0,200) : s.content_markdown))
                .ForMember(d => d.Likes, o => o.MapFrom(s => s.likes_count))
                .ForMember(d => d.Views, o => o.MapFrom(s => s.view_count))
                .ForMember(d => d.Bookmarks, o => o.MapFrom(s => s.bookmarks_count))
                .ForMember(d => d.PublishedAt, o => o.MapFrom(s => s.published_at))
                .ForMember(d => d.ReadingTimeMinutes, o => o.MapFrom(s => s.reading_time_minutes))
                .ForMember(d => d.AuthorDisplayName, o => o.MapFrom(s => s.User != null ? s.User.display_name : string.Empty));

            CreateMap<CreatePostDto, Post>()
                .ForMember(d => d.content_markdown, o => o.MapFrom(s => s.Content))
                .ForMember(d => d.title, o => o.MapFrom(s => s.Title))
                .ForMember(d => d.slug, o => o.MapFrom(s => s.Title))
                .ForMember(d => d.cover_img_url, o => o.MapFrom(s => s.CoverImageUrl))
                .ForMember(d => d.status, o => o.MapFrom(s => s.PublishNow));
        }
    }
}

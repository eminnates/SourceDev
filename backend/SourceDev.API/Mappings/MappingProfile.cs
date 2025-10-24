using AutoMapper;
using SourceDev.API.DTOs.Auth;
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
        }
    }
}

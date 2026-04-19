using AutoMapper;
using MovieBooking.Application.DTOs.Auth;
using MovieBooking.Application.DTOs.Booking;
using MovieBooking.Application.DTOs.Cinema;
using MovieBooking.Application.DTOs.Movie;
using MovieBooking.Application.DTOs.Promotion;
using MovieBooking.Application.DTOs.Showtime;
using MovieBooking.Application.DTOs.User;
using MovieBooking.Domain.Entities;

namespace MovieBooking.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Phim mappings
            CreateMap<Phim, PhimDto>();
            CreateMap<CreatePhimDto, Phim>();

            // Rap mappings
            CreateMap<Rap, RapDto>();
            CreateMap<CreateRapDto, Rap>();
            CreateMap<UpdateRapDto, Rap>();

            // PhongChieu mappings
            CreateMap<PhongChieu, PhongChieuDto>()
                .ForMember(dest => dest.TenRap, opt => opt.MapFrom(src => src.Rap.TenRap))
                .ForMember(dest => dest.SoHangGhe, opt => opt.MapFrom(src => src.Ghes == null ? 0 : src.Ghes
                    .Select(g => g.SoGhe.Length >= 1 ? g.SoGhe.Substring(0, 1) : string.Empty)
                    .Where(v => !string.IsNullOrEmpty(v))
                    .Distinct().Count()))
                .ForMember(dest => dest.SoGheMotHang, opt => opt.MapFrom(src => src.Ghes == null ? 0 : src.Ghes
                    .Select(g => g.SoGhe.Length <= 1 ? 0 : int.Parse(g.SoGhe.Substring(1)))
                    .DefaultIfEmpty(0).Max()));

            // Ghe mappings
            CreateMap<Ghe, GheDto>();

            // LichChieu mappings
            CreateMap<LichChieu, LichChieuDto>()
                .ForMember(dest => dest.TenPhim, opt => opt.MapFrom(src => src.Phim.TenPhim))
                .ForMember(dest => dest.TenPhong, opt => opt.MapFrom(src => src.PhongChieu.TenPhong))
                .ForMember(dest => dest.TenRap, opt => opt.MapFrom(src => src.PhongChieu.Rap.TenRap));
            CreateMap<CreateLichChieuDto, LichChieu>();

            // DonDatVe mappings
            CreateMap<DonDatVe, BookingResponseDto>()
                .ForMember(dest => dest.TenPhim, opt => opt.MapFrom(src => src.LichChieu.Phim.TenPhim))
                .ForMember(dest => dest.GioBatDau, opt => opt.MapFrom(src => src.LichChieu.GioBatDau))
                .ForMember(dest => dest.TenRap, opt => opt.MapFrom(src => src.LichChieu.PhongChieu.Rap.TenRap))
                .ForMember(dest => dest.TenPhong, opt => opt.MapFrom(src => src.LichChieu.PhongChieu.TenPhong))
                .ForMember(dest => dest.DanhSachGhe, opt => opt.MapFrom(src => src.Ves.Select(v => v.Ghe.SoGhe).ToList()));

            // NguoiDung mappings
            CreateMap<RegisterDto, NguoiDung>()
                .ForMember(dest => dest.MatKhauHash, opt => opt.Ignore())
                .ForMember(dest => dest.VaiTro, opt => opt.MapFrom(src => "KhachHang"));
            CreateMap<NguoiDung, NguoiDungDto>();

            // KhuyenMai mappings
            CreateMap<KhuyenMai, KhuyenMaiDto>();
            CreateMap<CreateKhuyenMaiDto, KhuyenMai>();
            CreateMap<UpdateKhuyenMaiDto, KhuyenMai>();
        }
    }
}

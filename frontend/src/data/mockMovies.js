export const mockMovies = [
  {
    id: 1, tenPhim: 'Avengers: Doomsday', moTa: 'Các siêu anh hùng tập hợp để đối mặt với mối đe dọa lớn nhất từ trước đến nay.',
    thoiLuong: 150, daoVien: 'Russo Brothers', dienVien: 'Robert Downey Jr., Chris Evans',
    dangChieu: true, theLoai: 'Hành động', xepHang: 4.8,
    posterUrl: 'https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg',
  },
  {
    id: 2, tenPhim: 'Minecraft: The Movie', moTa: 'Cuộc phiêu lưu kỳ thú trong thế giới khối vuông huyền thoại.',
    thoiLuong: 120, daoVien: 'Jared Hess', dienVien: 'Jack Black, Jason Momoa',
    dangChieu: true, theLoai: 'Phiêu lưu', xepHang: 4.2,
    posterUrl: 'https://image.tmdb.org/t/p/w500/iPPTGh4Kwz2LFMSBMzZLMFMSBMz.jpg',
  },
  {
    id: 3, tenPhim: 'Mission: Impossible 8', moTa: 'Ethan Hunt trở lại với nhiệm vụ nguy hiểm nhất trong sự nghiệp.',
    thoiLuong: 163, daoVien: 'Christopher McQuarrie', dienVien: 'Tom Cruise',
    dangChieu: true, theLoai: 'Hành động', xepHang: 4.7,
    posterUrl: 'https://image.tmdb.org/t/p/w500/z53D72EAOxGRqdr7KXXWp9dJiDe.jpg',
  },
  {
    id: 4, tenPhim: 'Lilo & Stitch', moTa: 'Câu chuyện tình bạn đặc biệt giữa cô bé Hawaii và sinh vật ngoài hành tinh.',
    thoiLuong: 108, daoVien: 'Dean Fleischer Camp', dienVien: 'Maia Kealoha',
    dangChieu: true, theLoai: 'Hoạt hình', xepHang: 4.5,
    posterUrl: 'https://image.tmdb.org/t/p/w500/4YZpsylmjHbqeWzjKpUEF8gcLNW.jpg',
  },
  {
    id: 5, tenPhim: 'Thunderbolts', moTa: 'Nhóm siêu anh hùng bất đắc dĩ thực hiện nhiệm vụ bí mật.',
    thoiLuong: 127, daoVien: 'Jake Schreier', dienVien: 'Florence Pugh, Sebastian Stan',
    dangChieu: true, theLoai: 'Hành động', xepHang: 4.3,
    posterUrl: 'https://image.tmdb.org/t/p/w500/m9EtP1WMgHFHFBMnFBbFBMnFBbF.jpg',
  },
  {
    id: 6, tenPhim: 'Sinners', moTa: 'Hai anh em sinh đôi trở về quê hương và đối mặt với thế lực bóng tối.',
    thoiLuong: 137, daoVien: 'Ryan Coogler', dienVien: 'Michael B. Jordan',
    dangChieu: true, theLoai: 'Kinh dị', xepHang: 4.6,
    posterUrl: 'https://image.tmdb.org/t/p/w500/d8Ryb8AunYAuycVKDp5HpdWPKgC.jpg',
  },
  {
    id: 7, tenPhim: 'Superman', moTa: 'Hành trình của Clark Kent trở thành người hùng bảo vệ Trái Đất.',
    thoiLuong: 140, daoVien: 'James Gunn', dienVien: 'David Corenswet',
    dangChieu: false, theLoai: 'Siêu anh hùng', xepHang: 0,
    posterUrl: 'https://image.tmdb.org/t/p/w500/74oqQMFBMnFBbFBMnFBbFBMnFBb.jpg',
  },
  {
    id: 8, tenPhim: 'Jurassic World: Rebirth', moTa: 'Khủng long trỗi dậy trong thế giới hiện đại đầy nguy hiểm.',
    thoiLuong: 130, daoVien: 'Gareth Edwards', dienVien: 'Scarlett Johansson',
    dangChieu: false, theLoai: 'Phiêu lưu', xepHang: 0,
    posterUrl: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
  },
]

export const dangChieuMovies = mockMovies.filter(m => m.dangChieu)
export const sapChieuMovies = mockMovies.filter(m => !m.dangChieu)

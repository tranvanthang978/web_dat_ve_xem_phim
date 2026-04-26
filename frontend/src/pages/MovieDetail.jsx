import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import phimService from '../services/phimService'
import lichChieuService from '../services/lichChieuService'
import Loading from '../components/Loading'

export default function MovieDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const [movie, setMovie] = useState(null)
  const [showtimes, setShowtimes] = useState([])
  const [relatedMovies, setRelatedMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTrailer, setShowTrailer] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const showtimesRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const resMovie = await phimService.getById(id)
        const m = resMovie?.data || resMovie
        setMovie(m)

        const resShows = await lichChieuService.getByPhimId(id)
        const shows = (resShows?.data || resShows || [])
        setShowtimes(Array.isArray(shows) ? shows : [])

        const allMovies = await phimService.getAll()
        const all = Array.isArray(allMovies) ? allMovies : (allMovies?.data || [])
        setRelatedMovies(all)
      } catch (err) {
        console.error('Lấy phim thất bại', err)
        setMovie(null)
        setShowtimes([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // Scroll to content section if scroll param exists
  useEffect(() => {
    const shouldScroll = searchParams.get('scroll') === 'showtimes'
    if (shouldScroll && contentRef.current && !loading) {
      setTimeout(() => {
        const el = contentRef.current
        const top = el.getBoundingClientRect().top + window.scrollY - 80 // 80px = navbar height
        window.scrollTo({ top, behavior: 'smooth' })
      }, 300)
    }
  }, [loading, searchParams])

  if (loading) return <Loading fullScreen />
  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-3">Phim không tồn tại</h1>
          <Link to="/phim" className="bg-red-600 text-white px-6 py-2 rounded-md inline-block">Quay lại danh sách</Link>
        </div>
      </div>
    )
  }

  // Lọc suất chiếu hôm nay — dùng gioBatDau từ LichChieuDto
  const now = new Date()
  const todayStr = now.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' })

  // Parse datetime từ server (không có timezone) như local time
  const parseLocalDate = (raw) => {
    if (!raw) return null
    if (raw.endsWith('Z') || raw.includes('+')) return new Date(raw)
    return new Date(raw)
  }

  // Lấy tất cả các ngày có suất chiếu (chỉ từ hôm nay trở đi)
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const maxDate = new Date(todayMidnight.getTime() + 2 * 24 * 60 * 60 * 1000) // hôm nay + 2 ngày
  const availableDates = [...new Set(
    showtimes
      .map(s => parseLocalDate(s.gioBatDau))
      .filter(d => d && !isNaN(d) && d >= todayMidnight && d <= new Date(maxDate.getTime() + 24 * 60 * 60 * 1000 - 1))
      .map(d => d.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }))
  )].sort((a, b) => {
    const [da, ma, ya] = a.split('/').map(Number)
    const [db, mb, yb] = b.split('/').map(Number)
    return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db)
  })

  // Ngày đang chọn — mặc định là hôm nay nếu có, không thì ngày đầu tiên
  const activeDateStr = selectedDate || (availableDates.includes(todayStr) ? todayStr : availableDates[0] || todayStr)

  const displayShowtimes = showtimes.filter(show => {
    if (!show.gioBatDau) return false
    const d = parseLocalDate(show.gioBatDau)
    if (!d || isNaN(d)) return false
    return d.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }) === activeDateStr
  })


  // Group theo tên rạp — LichChieuDto có tenRap, tenPhong trực tiếp
  const groupedShowtimes = displayShowtimes.reduce((acc, show) => {
    const key = show.tenRap || 'Rạp chưa xác định'
    if (!acc[key]) acc[key] = { tenRap: key, diaChi: '', shows: [] }
    acc[key].shows.push(show)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#0A0C10] font-sans pb-20">
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20 blur-3xl transform scale-110"
            style={{ backgroundImage: `url(${movie.posterUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0C10]/50 via-[#0A0C10]/80 to-[#0A0C10]" />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row gap-10">
          <div className="flex-shrink-0 w-[260px] md:w-[300px] mx-auto md:mx-0">
            <img 
              src={movie.posterUrl} 
              alt={movie.tenPhim} 
              className="w-full rounded-lg shadow-2xl shadow-black/50 object-cover"
            />
          </div>

          <div className="flex-col flex justify-center mt-4 md:mt-0">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                {movie.dangChieu ? 'Đang chiếu' : 'Sắp chiếu'}
              </span>
              <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                16+
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-wide mb-4">
              {movie.tenPhim}
            </h1>
            
            <div className="flex items-center gap-3 text-sm text-gray-300 font-medium mb-6">
              <span className="flex items-center gap-1 text-white">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                {Number(movie.xepHang || 0).toFixed(1)} <span className="text-gray-500 font-normal">/5</span>
              </span>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <span>2024</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <span>{movie.theLoai || 'Chưa cập nhật'}</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <span>{movie.thoiLuong} phút</span>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed max-w-3xl mb-8">
              {movie.moTa}
            </p>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  if (showtimesRef.current) {
                    showtimesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }}
                className="bg-red-600 hover:bg-red-700 transition-colors text-white font-bold text-sm px-6 py-3 rounded flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
                ĐẶT VÉ NGAY
              </button>
              <button className="bg-[#2A2D34] hover:bg-[#3A3D44] transition-colors text-white font-bold text-sm px-6 py-3 rounded flex items-center gap-2" onClick={() => setShowTrailer(true)}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                XEM TRAILER
              </button>
            </div>
          </div>
        </div>
      </section>

      <div ref={contentRef} className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">
        
        <div className="lg:col-span-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[2px] bg-red-600"></div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Nội dung phim</h2>
          </div>

          <div className="text-gray-400 text-sm leading-relaxed space-y-4 mb-8">
            <p className="italic text-gray-300">"Một kiệt tác điện ảnh mới của năm 2024, phá vỡ mọi quy chuẩn về thể loại noir truyền thống."</p>
            <p>{movie.moTa}</p>
          </div>

          <div className="bg-[#15171E] rounded-xl p-6 grid grid-cols-2 gap-y-6 gap-x-6">
            <div>
              <h3 className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-2">Đạo diễn</h3>
              <p className="text-white text-sm font-medium">{movie.daoDien || 'Đang cập nhật'}</p>
            </div>
            <div>
              <h3 className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-2">Diễn viên</h3>
              <p className="text-white text-sm font-medium leading-relaxed">{movie.dienVien || 'Đang cập nhật'}</p>
            </div>
            <div>
              <h3 className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-2">Quốc gia</h3>
              <p className="text-white text-sm font-medium">Việt Nam</p>
            </div>
            <div>
              <h3 className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-2">Ngôn ngữ</h3>
              <p className="text-white text-sm font-medium">Tiếng Việt - Phụ đề Anh</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[2px] bg-red-600"></div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              Suất chiếu
            </h2>
          </div>

          {/* Tab chọn ngày */}
          {availableDates.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-4">
              {availableDates.map(dateStr => {
                const [d, m, y] = dateStr.split('/').map(Number)
                const dateObj = new Date(y, m - 1, d)
                const isToday = dateStr === todayStr
                const label = isToday ? 'Hôm nay' : dateObj.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
                const isActive = dateStr === activeDateStr
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                      isActive
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}

          <div ref={showtimesRef} className="space-y-3">
            {Object.keys(groupedShowtimes).length === 0 ? (
              <p className="text-gray-500 text-sm">
                {showtimes.length === 0 ? 'Chưa có lịch chiếu.' : 'Không có suất chiếu hôm nay.'}
              </p>
            ) : (
              Object.values(groupedShowtimes).map((theater, idx) => (
                <div key={idx} className="bg-[#15171E] rounded-xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-sm mb-0.5 truncate">{theater.tenRap}</h3>
                      {theater.diaChi && (
                        <p className="text-gray-500 text-xs">{theater.diaChi}</p>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-primary/70 flex-shrink-0 ml-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {theater.shows
                      .sort((a, b) => parseLocalDate(a.gioBatDau) - parseLocalDate(b.gioBatDau))
                      .map((show) => {
                        const t = parseLocalDate(show.gioBatDau)
                        const timeStr = t.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
                        const isPast = t < new Date()
                        return (
                          <Link
                            key={show.id}
                            to={`/dat-ve/${show.id}`}
                            className={`border text-sm font-bold py-1.5 px-4 rounded transition-all duration-200 ${
                              isPast
                                ? 'border-white/5 text-white/20 cursor-not-allowed pointer-events-none bg-white/3'
                                : 'bg-white/5 hover:bg-primary/20 border-white/10 hover:border-primary text-gray-300 hover:text-white'
                            }`}
                          >
                            {timeStr}
                          </Link>
                        )
                      })}
                  </div>
                </div>
              ))
            )}

            {Object.keys(groupedShowtimes).length > 0 && (
              <button
                onClick={() => showtimesRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full mt-2 text-gray-400 text-xs font-bold uppercase tracking-wider hover:text-white transition-colors py-3 border border-white/10 hover:border-white/30 rounded-xl block text-center"
              >
                Xem tất cả lịch chiếu
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 mt-20">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-lg font-black text-white uppercase tracking-wider">Phim cùng thể loại</h2>
          <Link to="/phim" className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
            Xem thêm <span className="text-lg leading-none">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {relatedMovies
            .filter(item => item && item.id !== movie.id && item.theLoai?.split(',').map(t => t.trim()).some(t => movie.theLoai?.includes(t)))
            .slice(0, 5)
            .map((item) => (
              <Link key={item.id} to={`/phim/${item.id}`} className="group block">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3">
                  <img src={item.posterUrl} alt={item.tenPhim} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <h3 className="text-white text-sm font-bold uppercase truncate">{item.tenPhim}</h3>
                <p className="text-gray-500 text-[11px]">{item.thoiLuong || '120'} phút</p>
              </Link>
            ))}
          {relatedMovies.filter(item => item && item.id !== movie.id && item.theLoai?.split(',').map(t => t.trim()).some(t => movie.theLoai?.includes(t))).length === 0 && (
            <p className="text-gray-500 text-sm col-span-full">Chưa có phim cùng thể loại.</p>
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowTrailer(false)}>
          <div className="relative max-w-4xl w-full max-h-[80vh] bg-[#0A0C10] rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h3 className="text-white font-bold text-lg">Trailer: {movie.tenPhim}</h3>
              <button onClick={() => setShowTrailer(false)} className="text-white/60 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="aspect-video">
              {movie.trailerUrl ? (
                (() => {
                  const url = movie.trailerUrl
                  let embedUrl = url

                  // Xử lý YouTube URL
                  if (url.includes('youtube.com') || url.includes('youtu.be')) {
                    if (url.includes('watch?v=')) {
                      embedUrl = url.replace('watch?v=', 'embed/').split('&')[0] + '?autoplay=1&rel=0'
                    } else if (url.includes('youtu.be/')) {
                      const videoId = url.split('youtu.be/')[1].split('?')[0]
                      embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
                    }
                  }
                  // Xử lý Vimeo URL
                  else if (url.includes('vimeo.com')) {
                    const videoId = url.split('/').pop().split('?')[0]
                    embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1`
                  }
                  // Nếu là direct video URL (mp4, etc.), dùng video tag
                  else if (url.match(/\.(mp4|webm|ogg)$/i)) {
                    return (
                      <video
                        src={url}
                        controls
                        autoPlay
                        className="w-full h-full"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      >
                        <div className="w-full h-full flex items-center justify-center bg-[#15171E] text-white">
                          <p>Không thể tải video</p>
                        </div>
                      </video>
                    )
                  }

                  return (
                    <iframe
                      src={embedUrl}
                      title={`Trailer ${movie.tenPhim}`}
                      className="w-full h-full"
                      allow="autoplay; encrypted-media; fullscreen"
                      allowFullScreen
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    ></iframe>
                  )
                })()
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#15171E] text-white">
                  <p>Trailer chưa có sẵn</p>
                </div>
              )}
              <div className="w-full h-full items-center justify-center bg-[#15171E] text-white hidden">
                <p>Không thể tải trailer</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import phimService from '../services/phimService'

const getOptimizedBannerUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return url
  const uploadPart = 'upload/'
  const params = 'c_fill,w_1920,h_1080,g_auto,q_auto:best,f_auto/'
  return url.replace(uploadPart, uploadPart + params)
}



export default function Home() {
  const [dangChieu, setDangChieu] = useState([])
  const [sapChieu, setSapChieu] = useState([])
  const [loading, setLoading] = useState(true)
  const [heroIndex, setHeroIndex] = useState(0)
  const [showTrailer, setShowTrailer] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState(null)

  // Chỉ lấy phim có backdropUrl làm banner, fallback về 3 phim đầu nếu không có
  const slidesWithBackdrop = dangChieu.filter(p => p.backdropUrl)
  const heroSlides = slidesWithBackdrop.length > 0 ? slidesWithBackdrop.slice(0, 5) : dangChieu.slice(0, 3)
  const hero = heroSlides.length > 0 ? heroSlides[heroIndex % heroSlides.length] : null

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [dcRes, allRes] = await Promise.all([
          phimService.getDangChieu(),
          phimService.getAll(),
        ])

        // getDangChieu trả về array phim đang chiếu
        setDangChieu(Array.isArray(dcRes) ? dcRes : [])

        // Sắp chiếu = tất cả phim - phim đang chiếu
        const allMovies = Array.isArray(allRes) ? allRes : []
        const dangChieuMap = new Set((Array.isArray(dcRes) ? dcRes : []).map(m => m.id))
        const sapChieuData = allMovies.filter(m => !dangChieuMap.has(m.id))

        setSapChieu(sapChieuData)
      } catch (err) {
        console.error('Lấy phim thất bại', err)
        setDangChieu([])
        setSapChieu([])
      } finally {
        setLoading(false)
      }
    }
    fetchMovies()
  }, [])

  // Auto-slide hero — reset timer khi user bấm mũi tên
  const [autoPlay, setAutoPlay] = useState(true)

  useEffect(() => {
    if (!autoPlay || heroSlides.length <= 1) return
    const timer = setInterval(() => {
      setHeroIndex(i => (i + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [autoPlay, heroIndex, heroSlides.length])

  const goPrev = () => {
    setHeroIndex(i => (i - 1 + heroSlides.length) % heroSlides.length)
    setAutoPlay(false)
    setTimeout(() => setAutoPlay(true), 8000)
  }

  const goNext = () => {
    setHeroIndex(i => (i + 1) % heroSlides.length)
    setAutoPlay(false)
    setTimeout(() => setAutoPlay(true), 8000)
  }

  return (
    <div className="min-h-screen">
      {/* ===== HERO BANNER ===== */}
      <section className="relative h-[85vh] min-h-[560px] overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          {loading || !hero ? (
            <div className="absolute inset-0 bg-dark-card" />
          ) : (
            heroSlides.map((slide, i) => (
              <div
                key={slide.id}
                style={{ transition: 'opacity 900ms ease, transform 900ms ease' }}
                className={`absolute inset-0 ${i === heroIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
              >
                {(slide.backdropUrl || slide.posterUrl) ? (
                  <img
                    src={getOptimizedBannerUrl(slide.backdropUrl || slide.posterUrl)}
                    alt={slide.tenPhim}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                ) : (
                  <div className="w-full h-full bg-dark-card" />
                )}
              </div>
            ))
          )}
          {/* Gradient overlays (giảm mờ, ảnh nét hơn) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative h-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div key={heroIndex} className="max-w-xl hero-content-in">
            {/* Badge */}
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded">
                ĐANG CHIẾU
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => {
                  const rating = Number(hero?.xepHang ?? 0)
                  const fullStars = Math.floor(rating)
                  const fraction = rating - fullStars
                  let fillType = 'empty'
                  if (i < fullStars) fillType = 'full'
                  else if (i === fullStars && fraction >= 0.25) fillType = fraction >= 0.75 ? 'full' : 'half'

                  const fillColor = fillType === 'full' ? '#facc15' : fillType === 'half' ? 'url(#star-half)' : '#ffffff33'

                  return (
                    <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 20 20">
                      <defs>
                        <linearGradient id="star-half" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="50%" stopColor="#facc15" />
                          <stop offset="50%" stopColor="#ffffff33" />
                        </linearGradient>
                      </defs>
                      <path fill={fillColor} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  )
                })}
                <span className="text-white/60 text-xs ml-1">{hero?.xepHang?.toFixed(1) || '0.0'}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-2">
              <span className="text-white">{hero?.tenPhim || 'Phim Tuyệt Vời'}</span>
            </h1>

            <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-8 max-w-md line-clamp-3">
              {hero?.moTa || 'Cập nhật mô tả phim ngay khi có dữ liệu thực tế.'}
            </p>

            <div className="flex items-center gap-3">
              <Link to={`/phim/${hero?.id ?? ''}`} className="btn-primary flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                Xem chi tiết
              </Link>
              <button 
                onClick={() => { setSelectedMovie(hero); setShowTrailer(true) }}
                className="btn-outline flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Xem trailer
              </button>
            </div>
          </div>
        </div>

        {/* Arrow buttons */}
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 hover:border-white/30 flex items-center justify-center text-white transition-all backdrop-blur-sm z-10"
          aria-label="Slide trước"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 hover:border-white/30 flex items-center justify-center text-white transition-all backdrop-blur-sm z-10"
          aria-label="Slide tiếp theo"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setHeroIndex(i); setAutoPlay(false); setTimeout(() => setAutoPlay(true), 8000) }}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === heroIndex ? 'w-8 bg-primary' : 'w-2 bg-white/30 hover:bg-white/50'}`}
            />
          ))}
        </div>
      </section>

      {/* ===== ĐANG CHIẾU ===== */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <h2 className="text-xl font-bold text-white">ĐANG CHIẾU</h2>
            </div>
            <p className="text-sm text-white/40 ml-3">Trải nghiệm những bom tấn mới nhất tại rạp</p>
          </div>
          <Link to="/phim" className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1 transition-colors">
            Xem tất cả
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {dangChieu.slice(0, 6).map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))} 
          </div>
        )}
      </section>

      {/* ===== SẮP CHIẾU + PROMO ===== */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sắp chiếu list */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-6 bg-yellow-500 rounded-full" />
              <h2 className="text-xl font-bold text-white">SẮP CHIẾU</h2>
            </div>
            <div className="space-y-3">
              {sapChieu.slice(0, 2).map(movie => (
                <SapChieuItem key={movie.id} movie={movie} />
              ))}
            </div>
          </div>

          {/* Promo card */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 flex flex-col justify-between min-h-[280px]">
            <div>
              <span className="text-xs font-bold text-white/70 uppercase tracking-widest">Ưu đãi đặc biệt</span>
              <h3 className="text-2xl font-black text-white mt-2 mb-3">
                Tham gia<br />TTA Club
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Nhận ưu đãi độc quyền, đặt vé ưu tiên và giảm 20% cho mọi giao dịch từ 150.000đ.
              </p>
            </div>
            <div>
              <Link
                to="/register"
                className="block w-full text-center bg-white text-primary font-bold py-3 rounded-xl hover:bg-white/90 transition-colors mt-6"
              >
                Tham gia ngay
              </Link>
              <p className="text-xs text-white/50 text-center mt-2">Hơn 50.000 thành viên đang tham gia</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trailer Modal */}
      {showTrailer && selectedMovie && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowTrailer(false)}>
          <div className="relative max-w-4xl w-full max-h-[80vh] bg-[#0A0C10] rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h3 className="text-white font-bold text-lg">Trailer: {selectedMovie.tenPhim}</h3>
              <button onClick={() => setShowTrailer(false)} className="text-white/60 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="aspect-video">
              {selectedMovie.trailerUrl ? (
                (() => {
                  const url = selectedMovie.trailerUrl
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
                  // Nếu là direct video URL (mp4, webm, ogg), dùng video tag
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
                      title={`Trailer ${selectedMovie.tenPhim}`}
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

function SapChieuItem({ movie }) {
  return (
    <Link
      to={`/phim/${movie.id}`}
      className="flex items-center gap-4 bg-dark-card border border-dark-border rounded-xl p-3 hover:border-white/20 transition-colors group"
    >
      {/* Poster nhỏ */}
      <div className="w-14 h-20 rounded-lg overflow-hidden bg-dark-border shrink-0">
        {movie.posterUrl ? (
          <img src={movie.posterUrl} alt={movie.tenPhim} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
        ) : (
          <div className="w-full h-full bg-dark-border" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wide">Sắp chiếu</span>
        <h4 className="text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-1 mt-0.5">
          {movie.tenPhim}
        </h4>
        <p className="text-xs text-white/40 line-clamp-1 mt-1">{movie.moTa}</p>
      </div>

      {/* CTA */}
      <span className="shrink-0 text-xs font-semibold text-primary border border-primary/40 px-3 py-1.5 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
        Nhắc tôi
      </span>
    </Link>
  )
}

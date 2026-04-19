import { Link, useNavigate } from 'react-router-dom'

export default function MovieCard({ movie }) {
  const { id, tenPhim, theLoai, thoiLuong, xepHang, posterUrl, dangChieu } = movie
  const navigate = useNavigate()

  return (
    <div
      className="card-movie group block relative cursor-pointer"
      onClick={() => navigate(`/phim/${id}`)}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-dark-border">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={tenPhim}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
        )}

        {/* Badge */}
        <div className="absolute top-2 left-2">
          {dangChieu ? (
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded">ĐANG CHIẾU</span>
          ) : (
            <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded">SẮP CHIẾU</span>
          )}
        </div>

        {/* Rating */}
        {xepHang > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 rounded px-1.5 py-0.5">
            <div className="flex items-center gap-[2px]">
              {Array.from({ length: 5 }, (_, i) => {
                const f = Number(xepHang || 0)
                const fullStars = Math.floor(f)
                const frac = f - fullStars
                let type = 'empty'
                if (i < fullStars) type = 'full'
                else if (i === fullStars && frac >= 0.25) type = frac >= 0.75 ? 'full' : 'half'
                return (
                  <svg key={i} className="w-3 h-3" viewBox="0 0 20 20">
                    <defs>
                      <linearGradient id={`mcard-star-half-${i}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="50%" stopColor="#facc15" />
                        <stop offset="50%" stopColor="#ffffff33" />
                      </linearGradient>
                    </defs>
                    <path
                      fill={type === 'full' ? '#facc15' : type === 'half' ? `url(#mcard-star-half-${i})` : '#ffffff33'}
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                )
              })}
            </div>
            <span className="text-[11px] font-semibold text-white">{Number(xepHang).toFixed(1)}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 flex-col">
          <Link
            to={`/phim/${id}?scroll=showtimes`}
            onClick={e => e.stopPropagation()}
            className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded hover:bg-primary-dark transition-colors"
          >
            Đặt vé
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-white line-clamp-1 mb-1">{tenPhim}</h3>
        <div className="flex items-center justify-between text-xs text-white/40">
          <span>{theLoai}</span>
          {thoiLuong && <span>{thoiLuong} phút</span>}
        </div>
      </div>
    </div>
  )
}

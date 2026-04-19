import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import phimService from '../services/phimService'

const GENRES = ['Tất cả', 'Hành động', 'Phiêu lưu', 'Kinh dị', 'Hoạt hình', 'Siêu anh hùng', 'Tình cảm', 'Hài']
const RATINGS = ['Tất cả', '4.5+', '4.0+', '3.5+']
const SORT_OPTIONS = [
  { value: 'default', label: 'Mặc định' },
  { value: 'rating_desc', label: 'Đánh giá cao nhất' },
  { value: 'name_asc', label: 'Tên A → Z' },
  { value: 'duration_desc', label: 'Thời lượng dài nhất' },
]
const PAGE_SIZE = 12

const capitalize = (str) => str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
const INITIAL_GENRES = ['Tất cả', 'Hành động', 'Tình cảm', 'Hài', 'Kinh dị', 'Hoạt hình']

export default function Movies() {
  const [allMovies, setAllMovies] = useState({ dangChieu: [], sapChieu: [] })
  const [tab, setTab] = useState('dang-chieu')
  const [genre, setGenre] = useState('Tất cả')
  const [rating, setRating] = useState('Tất cả')
  const [sort, setSort] = useState('default')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAllGenres, setShowAllGenres] = useState(false)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        const dcRes = await phimService.getDangChieu()
        const allRes = await phimService.getAll()
        
        const dangChieuMap = new Set(dcRes.map(m => m.id))
        const sapChieuData = allRes.filter(m => !dangChieuMap.has(m.id))
        
        setAllMovies({ dangChieu: dcRes, sapChieu: sapChieuData })
      } catch (error) {
        console.error('Lỗi tải dữ liệu phim:', error)
        setAllMovies({ dangChieu: [], sapChieu: [] })
      } finally {
        setLoading(false)
      }
    }
    fetchMovies()
  }, [])

  // Tạo danh sách thể loại động từ dữ liệu phim
  const availableGenres = useMemo(() => {
    const allGenres = new Set()
    const movies = [...(allMovies.dangChieu || []), ...(allMovies.sapChieu || [])]
    movies.forEach(movie => {
      if (movie.theLoai) {
        movie.theLoai.split(',').forEach(g => allGenres.add(capitalize(g.trim())))
      }
    })
    return ['Tất cả', ...Array.from(allGenres).sort()]
  }, [allMovies])

  const displayedGenres = showAllGenres ? availableGenres : INITIAL_GENRES

  // Reset genre nếu không còn hợp lệ
  useEffect(() => {
    if (!displayedGenres.includes(genre)) {
      setGenre('Tất cả')
    }
  }, [displayedGenres, genre])

  const filtered = useMemo(() => {
    const movies = tab === 'dang-chieu' ? (allMovies.dangChieu || []) : (allMovies.sapChieu || [])
    let list = [...movies]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(m => m.tenPhim.toLowerCase().includes(q))
    }
    if (genre !== 'Tất cả') {
      list = list.filter(m => {
        if (!m.theLoai) return false
        const movieGenres = m.theLoai.split(',').map(g => g.trim())
        return movieGenres.includes(genre)
      })
    }
    if (rating !== 'Tất cả') {
      const min = parseFloat(rating)
      list = list.filter(m => (m.xepHang || 0) >= min)
    }

    if (sort === 'rating_desc') list = [...list].sort((a, b) => (b.xepHang || 0) - (a.xepHang || 0))
    else if (sort === 'name_asc') list = [...list].sort((a, b) => a.tenPhim.localeCompare(b.tenPhim, 'vi'))
    else if (sort === 'duration_desc') list = [...list].sort((a, b) => (b.thoiLuong || 0) - (a.thoiLuong || 0))

    return list
  }, [tab, genre, rating, sort, search, allMovies])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleTab = (t) => { setTab(t); setPage(1) }
  const handleGenre = (g) => { setGenre(g); setPage(1) }
  const handleRating = (r) => { setRating(r); setPage(1) }
  const handleSort = (s) => { setSort(s); setPage(1) }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ===== SIDEBAR ===== */}
          <aside className="lg:w-60 shrink-0 space-y-6 mt-[6px]">
            {/* Bộ lọc Header */}
            <div className="mb-8">
               <h2 className="text-xs font-semibold text-white/50 uppercase tracking-widest">Bộ lọc phim</h2>
            </div>

            {/* Search */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-3">Tìm kiếm</label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Tên phim..."
                  className="input-field text-sm pr-9 w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Genre */}
            <div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-white/80">Thể loại</label>
              </div>
              <div className="flex flex-col gap-2">
                {displayedGenres.map(g => (
                  <label key={g} onClick={() => handleGenre(g)} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${genre === g ? 'bg-red-600 border-red-600' : 'border-white/20 group-hover:border-white/50'}`}>
                      {genre === g && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className={`text-sm transition-colors ${genre === g ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                      {g}
                    </span>
                  </label>
                ))}
                {!showAllGenres && availableGenres.length > INITIAL_GENRES.length && (
                  <button
                    onClick={() => setShowAllGenres(true)}
                    className="w-full text-left text-sm px-3 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Xem thêm
                  </button>
                )}
              </div>
            </div>

            {/* Rating */}
            <div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-white/80">Đánh giá</label>
              </div>
              <div className="space-y-1.5">
                {RATINGS.map(r => (
                  <button
                    key={r}
                    onClick={() => handleRating(r)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                      rating === r
                        ? 'bg-red-600/15 text-red-500 border border-red-600/30'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {r !== 'Tất cả' && (
                      <svg className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset */}
            {(genre !== 'Tất cả' || rating !== 'Tất cả' || search) && (
              <button
                onClick={() => { setGenre('Tất cả'); setRating('Tất cả'); setSearch(''); setPage(1) }}
                className="w-full text-sm text-white/40 hover:text-white border border-white/10 hover:border-white/30 py-2 rounded-lg transition-all"
              >
                Xóa bộ lọc
              </button>
            )}
          </aside>

          {/* ===== MAIN CONTENT ===== */}
          <div className="flex-1 min-w-0">
            {/* Header Main Content */}
            <div className="mb-10">
              <h1 className="text-4xl sm:text-[44px] font-bold text-white mb-4 tracking-tight">Danh sách phim</h1>
              <p className="text-[15px] text-white/60 max-w-3xl leading-relaxed">
                Khám phá thế giới điện ảnh đa dạng với những siêu phẩm mới nhất được cập nhật liên tục từ Hollywood và khắp nơi trên thế giới.
              </p>
            </div>

            {/* Tabs + Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              {/* Tabs */}
              <div className="flex bg-dark-card border border-white/10 rounded-xl p-1 w-fit">
                <button
                  onClick={() => handleTab('dang-chieu')}
                  className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                    tab === 'dang-chieu' ? 'bg-red-600 text-white' : 'text-white/50 hover:text-white'
                  }`}
                >
                  Đang chiếu
                </button>
                <button
                  onClick={() => handleTab('sap-chieu')}
                  className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                    tab === 'sap-chieu' ? 'bg-red-600 text-white' : 'text-white/50 hover:text-white'
                  }`}
                >
                  Sắp chiếu
                </button>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-3">
                <select
                  value={sort}
                  onChange={e => handleSort(e.target.value)}
                  className="bg-dark-card border border-white/10 text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:border-red-600 transition-colors bg-transparent"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value} className="bg-[#0A0C10]">{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12 text-white/50">
                <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-white/30">
                <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                <p className="text-lg font-medium">Không tìm thấy phim</p>
                <p className="text-sm mt-1">Thử thay đổi bộ lọc</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-4">
                {paginated.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                      p === page
                        ? 'bg-red-600 text-white'
                        : 'border border-white/10 text-white/50 hover:text-white hover:border-white/30'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
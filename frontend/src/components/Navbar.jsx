import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import phimService from '../services/phimService'

export default function Navbar() {
  const { user, logout, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [allMovies, setAllMovies] = useState([])
  const searchRef = useRef(null)

  const navLinks = [
    { to: '/', label: 'Trang chủ', end: true },
    { to: '/phim', label: 'Phim' },
    { to: '/khuyen-mai', label: 'Khuyến mãi' },
  ]

  // Fetch movies for search
  useEffect(() => {
    phimService.getAll()
      .then(res => setAllMovies(res?.data || res || []))
      .catch(() => {})
  }, [])

  // filter
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) { setSearchResults([]); return }
    const results = allMovies.filter(m =>
      m.tenPhim?.toLowerCase().includes(q)
    ).slice(0, 5)
    setSearchResults(results)
  }, [searchQuery, allMovies])

  // Đóng search khi click ngoài
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/phim?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setSearchOpen(false)
    }
  }

  const handleSelectResult = (id) => {
    navigate(`/phim/${id}`)
    setSearchQuery('')
    setSearchOpen(false)
  }

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-sm border-b border-dark-border">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex-1 flex items-center">
            <Link to="/" className="shrink-0">
              <span className="text-2xl font-black tracking-tight">
                <span className="text-primary">TTA</span>
                <span className="text-white">Movie</span>
              </span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center justify-center gap-1 shrink-0">
            {navLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-3 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive ? 'text-white bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4 shrink-0">

          {/* Search bar */}
          <div ref={searchRef} className="relative hidden sm:block">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true) }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Tìm kiếm phim..."
                  className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary focus:bg-white/8 transition-all w-48 focus:w-64"
                />
              </div>
            </form>

            {/* Dropdown kết quả */}
            {searchOpen && searchQuery && (
              <div className="absolute top-full mt-2 right-0 w-72 bg-dark-card border border-dark-border rounded-xl shadow-2xl overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <>
                    {searchResults.map(movie => (
                      <button
                        key={movie.id}
                        onClick={() => handleSelectResult(movie.id)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="w-8 h-11 rounded overflow-hidden bg-dark-border shrink-0">
                          {movie.posterUrl && (
                            <img src={movie.posterUrl} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium truncate">{movie.tenPhim}</p>
                          <p className="text-xs text-white/40">{movie.theLoai} · {movie.thoiLuong} phút</p>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full px-4 py-2.5 text-xs text-primary hover:bg-white/5 transition-colors text-left border-t border-dark-border"
                    >
                      Xem tất cả kết quả cho "{searchQuery}"
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-4 text-sm text-white/40 text-center">
                    Không tìm thấy phim nào
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Auth / User */}
          <div className="flex items-center gap-2 shrink-0">
            {isLoggedIn ? (
              <div className="relative group">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-lg">
                    {user?.hoTen?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs text-white/50">Xin chào,</p>
                    <p className="text-sm font-semibold text-white max-w-[100px] truncate">
                      {user?.hoTen}
                    </p>
                  </div>
                  <svg className={`w-4 h-4 text-white/40 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-3 w-72 bg-dark-card border border-primary/20 rounded-2xl shadow-2xl z-20 overflow-hidden backdrop-blur-sm animate-in fade-in slide-in-from-top-2 origin-top-right">
                      {/* Header with user info */}
                      <div className="px-6 py-4 bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/10">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-lg font-bold text-white">
                            {user?.hoTen?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white">{user?.hoTen}</p>
                            <p className="text-xs text-white/50">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-2">
                        <Link
                          to="/tai-khoan"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-6 py-3 text-sm text-white/70 hover:text-white hover:bg-primary/10 transition-colors group"
                        >
                          <svg className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Thông tin tài khoản</span>
                          <svg className="w-3.5 h-3.5 ml-auto text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>

                        <Link
                          to="/ve-cua-toi"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-6 py-3 text-sm text-white/70 hover:text-white hover:bg-primary/10 transition-colors group"
                        >
                          <svg className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                          </svg>
                          <span>Vé của tôi</span>
                          <svg className="w-3.5 h-3.5 ml-auto text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                      {/* Logout button */}
                      <div className="p-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-6 py-3 text-sm text-red-400/80 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors group"
                        >
                          <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/register" className="text-sm text-white/70 hover:text-white px-3 py-1.5 transition-colors hidden sm:block">
                  Đăng ký
                </Link>
                <Link to="/login" className="btn-primary text-sm py-1.5 px-4">
                  Đăng nhập
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-white/70 hover:text-white ml-1"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-dark-border py-3 space-y-1">
            {/* Mobile search */}
            <div className="px-2 pb-2">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm phim..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary"
                  />
                </div>
              </form>
            </div>
            {navLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded text-sm font-medium transition-colors ${
                    isActive ? 'text-white bg-white/10' : 'text-white/70 hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}

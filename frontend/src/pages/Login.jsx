import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import authService from '../services/authService'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ tenDangNhap: '', matKhau: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.tenDangNhap.trim() || !form.matKhau) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    setLoading(true)
    setError('')

    try {
      const apiRes = await authService.login(form.tenDangNhap.trim(), form.matKhau)

      const success = apiRes?.success ?? apiRes?.Success
      const message = apiRes?.message || apiRes?.Message || ''
      const data = apiRes?.data || apiRes?.Data

      const token = data?.token || data?.Token
      const userId = data?.userId ?? data?.UserId
      const hoTen = data?.hoTen || data?.HoTen || ''
      const tenDangNhap = data?.tenDangNhap || data?.TenDangNhap || hoTen
      const email = data?.email || data?.Email || ''
      const vaiTro = data?.vaiTro || data?.VaiTro || 'KhachHang'

      if (success && token) {
        login({ userId, hoTen, tenDangNhap, email, vaiTro }, token)
        if (vaiTro === 'Admin') {
          navigate('/admin', { replace: true })
        } else {
          navigate(from === '/dang-nhap' || from === '/dang-ky' ? '/' : from, { replace: true })
        }
      } else {
        setError(message || 'Đăng nhập thất bại')
      }
    } catch (err) {
      if (err.code === 'ERR_NETWORK') {
        setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.')
      } else {
        const msg = err.response?.data?.message || err.response?.data?.Message
        setError(msg || 'Tên đăng nhập hoặc mật khẩu không đúng')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://image.tmdb.org/t/p/original/1E5baAaEse26fej7uHcjOgEE2t2.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/80 to-dark/40" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <Link to="/" className="mb-auto pt-8">
            <span className="text-3xl font-black">
              <span className="text-primary">TTA</span>
              <span className="text-white">Movie</span>
            </span>
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-white mb-3">Chào mừng trở lại!</h2>
            <p className="text-white/60 text-base leading-relaxed max-w-sm">
              Đăng nhập để đặt vé, theo dõi lịch chiếu và nhận ưu đãi độc quyền từ TTA Movie.
            </p>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-dark">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/">
              <span className="text-3xl font-black">
                <span className="text-primary">TTA</span>
                <span className="text-white">Movie</span>
              </span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Đăng nhập</h1>
            <p className="text-white/40 text-sm">Nhập tên đăng nhập và mật khẩu</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Tên đăng nhập */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Tên đăng nhập</label>
              <input
                type="text"
                name="tenDangNhap"
                value={form.tenDangNhap}
                onChange={handleChange}
                placeholder="Nhập họ tên của bạn"
                className="input-field"
                autoComplete="username"
                autoFocus
              />
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="matKhau"
                  value={form.matKhau}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  className="input-field pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang đăng nhập...
                </>
              ) : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/quen-mat-khau" className="text-primary font-medium hover:text-primary-dark">
              Quên mật khẩu?
            </Link>
          </div>

          <p className="text-center text-sm text-white/40 mt-6">
            Chưa có tài khoản?{' '}
            <Link to="/dang-ky" className="text-primary font-medium transition-all duration-300 hover:text-primary-dark hover:-translate-y-[1px] hover:scale-[1.02]">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

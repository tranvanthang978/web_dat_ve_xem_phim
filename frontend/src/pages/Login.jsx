import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import authService from '../services/authService'
import { useGoogleLogin } from '@react-oauth/google'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ tenDangNhap: '', matKhau: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

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

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true)
      setError('')
      try {
        const apiRes = await authService.googleLogin(tokenResponse.access_token)

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
          setError(message || 'Đăng nhập Google thất bại')
        }
      } catch (err) {
        const msg = err.response?.data?.message || err.response?.data?.Message
        setError(msg || 'Đăng nhập Google thất bại. Vui lòng thử lại.')
      } finally {
        setGoogleLoading(false)
      }
    },
    onError: () => {
      setError('Đăng nhập Google thất bại')
      setGoogleLoading(false)
    }
  })

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

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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

            {/* Mật khẩu & Quên mật khẩu cùng 1 dòng */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-white/70">Mật khẩu</label>
                <Link to="/quen-mat-khau" className="text-primary font-medium hover:text-primary-dark transition-colors text-sm">
                  Quên mật khẩu?
                </Link>
              </div>
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
              className="w-full btn-primary py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-4 transition-transform active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang đăng nhập...
                </>
              ) : 'Đăng nhập'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7 opacity-60">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">Hoặc</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Custom Google Login Button */}
          <button
            type="button"
            onClick={() => {
              setGoogleLoading(true)
              loginWithGoogle()
            }}
            disabled={googleLoading}
            className="w-full py-3 px-4 bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 rounded-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <div className="bg-white p-0.5 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
            )}
            <span className="text-white text-sm font-semibold">Đăng nhập với Google</span>
          </button>

          <p className="text-center text-sm text-white/40 mt-8">
            Chưa có tài khoản?{' '}
            <Link to="/dang-ky" className="text-primary font-medium transition-all duration-300 hover:text-primary-dark hover:-translate-y-[1px] hover:scale-[1.02] inline-block">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
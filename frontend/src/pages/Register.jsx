import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import authService from '../services/authService'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ hoTen: '', email: '', soDienThoai: '', matKhau: '', xacNhanMatKhau: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

const [showConfirm, setShowConfirm] = useState(false)

  // Khai báo hàm handleChange ở đây
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    
    // Xóa lỗi của field tương ứng khi người dùng bắt đầu gõ lại
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    if (apiError) setApiError('')
  }

  const validate = () => {
    const newErrors = {}
    if (!form.hoTen.trim()) newErrors.hoTen = 'Vui lòng nhập họ tên'

    if (!form.email) newErrors.email = 'Vui lòng nhập email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Email không hợp lệ'

    if (form.soDienThoai && !/^(0|\+84)[0-9]{9}$/.test(form.soDienThoai))
      newErrors.soDienThoai = 'Số điện thoại không hợp lệ'

    if (!form.matKhau) newErrors.matKhau = 'Vui lòng nhập mật khẩu'

    if (!form.xacNhanMatKhau) newErrors.xacNhanMatKhau = 'Vui lòng xác nhận mật khẩu'
    else if (form.matKhau !== form.xacNhanMatKhau) newErrors.xacNhanMatKhau = 'Mật khẩu xác nhận không khớp'

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    setApiError('')

    try {
      const res = await authService.register(form.hoTen.trim(), form.email, form.matKhau, form.xacNhanMatKhau, form.soDienThoai)
      const data = res?.data || res
      const token = data?.token || data?.Token
      const userId = data?.userId ?? data?.UserId
      const hoTen = data?.hoTen || data?.HoTen || form.hoTen
      const email = data?.email || data?.Email || form.email
      const vaiTro = data?.vaiTro || data?.VaiTro || 'KhachHang'

      if ((res?.success !== false) && token) {
        login({ userId, hoTen, email, vaiTro }, token)
        navigate('/', { replace: true })
      } else {
        setApiError(res?.message || 'Đăng ký thất bại')
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.Message
      setApiError(msg || 'Đã có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://image.tmdb.org/t/p/original/d8Ryb8AunYAuycVKDp5HpdWPKgC.jpg"
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
            <h2 className="text-3xl font-bold text-white mb-3">Tham gia TTA Movie</h2>
            <p className="text-white/60 text-base leading-relaxed max-w-sm">
              Đăng ký miễn phí để đặt vé nhanh chóng, nhận thông báo phim mới và ưu đãi hấp dẫn.
            </p>
            <div className="flex items-center gap-6 mt-6">
              {[['50K+', 'Thành viên'], ['200+', 'Phim mỗi năm'], ['50+', 'Rạp chiếu']].map(([num, label]) => (
                <div key={label}>
                  <p className="text-2xl font-black text-primary">{num}</p>
                  <p className="text-xs text-white/50">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-dark overflow-y-auto">
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
            <h1 className="text-2xl font-bold text-white mb-1">Tạo tài khoản</h1>
            <p className="text-white/40 text-sm">Điền thông tin để bắt đầu trải nghiệm</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* API Error */}
            {apiError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-400">{apiError}</p>
              </div>
            )}

            {/* Họ tên */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Họ và tên</label>
              <input
                type="text"
                name="hoTen"
                value={form.hoTen}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className={`input-field ${errors.hoTen ? 'border-red-500/60' : ''}`}
                autoComplete="name"
              />
              {errors.hoTen && <p className="text-xs text-red-400 mt-1">{errors.hoTen}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className={`input-field ${errors.email ? 'border-red-500/60' : ''}`}
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Số điện thoại <span className="text-white/30">(tuỳ chọn)</span></label>
              <input
                type="tel"
                name="soDienThoai"
                value={form.soDienThoai}
                onChange={handleChange}
                placeholder="0912 345 678"
                className={`input-field ${errors.soDienThoai ? 'border-red-500/60' : ''}`}
                autoComplete="tel"
              />
              {errors.soDienThoai && <p className="text-xs text-red-400 mt-1">{errors.soDienThoai}</p>}
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
                  className={`input-field pr-11 ${errors.matKhau ? 'border-red-500/60' : ''}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  <EyeIcon show={showPassword} />
                </button>
              </div>
              {errors.matKhau && <p className="text-xs text-red-400 mt-1">{errors.matKhau}</p>}
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Xác nhận mật khẩu</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="xacNhanMatKhau"
                  value={form.xacNhanMatKhau}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                  className={`input-field pr-11 ${errors.xacNhanMatKhau ? 'border-red-500/60' : form.xacNhanMatKhau && form.xacNhanMatKhau === form.matKhau ? 'border-green-500/60' : ''}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  <EyeIcon show={showConfirm} />
                </button>
              </div>
              {errors.xacNhanMatKhau && <p className="text-xs text-red-400 mt-1">{errors.xacNhanMatKhau}</p>}
              {!errors.xacNhanMatKhau && form.xacNhanMatKhau && form.xacNhanMatKhau === form.matKhau && (
                <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Mật khẩu khớp
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang tạo tài khoản...
                </>
              ) : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Đã có tài khoản?{' '}
            <Link to="/dang-nhap" className="text-primary font-medium transition-all duration-300 hover:text-primary-dark hover:-translate-y-[1px] hover:scale-[1.02]">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function EyeIcon({ show }) {
  return show ? (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

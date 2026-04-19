import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import authService from '../services/authService'

function OtpInput({ value, onChange }) {
  const inputs = useRef([])

  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/g, '')
    if (!val) {
      const next = value.split('')
      next[i] = ''
      onChange(next.join(''))
      return
    }
    // paste nhiều số
    if (val.length > 1) {
      const digits = val.slice(0, 6).split('')
      const next = value.split('')
      digits.forEach((d, idx) => { if (i + idx < 6) next[i + idx] = d })
      onChange(next.join(''))
      const focusIdx = Math.min(i + digits.length, 5)
      inputs.current[focusIdx]?.focus()
      return
    }
    const next = value.split('')
    next[i] = val
    onChange(next.join(''))
    if (i < 5) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted.padEnd(6, '').slice(0, 6))
    const focusIdx = Math.min(pasted.length, 5)
    inputs.current[focusIdx]?.focus()
  }

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          className={`w-11 h-14 text-center text-xl font-bold rounded-xl border bg-white/5 text-white outline-none transition-all
            ${value[i] ? 'border-primary' : 'border-white/15'}
            focus:border-primary focus:bg-white/8 focus:ring-2 focus:ring-primary/20`}
        />
      ))}
    </div>
  )
}

export default function ForgotPassword() {
  const [step, setStep] = useState(1) // 1: nhập email, 2: nhập OTP, 3: nhập mật khẩu mới, 4: thành công
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [matKhauMoi, setMatKhauMoi] = useState('')
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showMK, setShowMK] = useState(false)
  const [showXN, setShowXN] = useState(false)

  // Bước 1: Gửi OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Vui lòng nhập email'); return }
    setLoading(true)
    try {
      const res = await authService.forgotPassword(email.trim())
      setSuccess(res?.message || res?.Message || 'Mã OTP đã được gửi')
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.Message || 'Không thể gửi mã OTP. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // Bước 2: Xác nhận OTP — gọi API verify OTP thật
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    if (otp.length !== 6) { setError('Vui lòng nhập đủ 6 số'); return }
    setLoading(true)
    try {
      await authService.verifyOtp(email.trim(), otp.trim())
      setStep(3)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.Message
      setError(msg || 'Mã OTP không đúng hoặc đã hết hạn')
    } finally {
      setLoading(false)
    }
  }

  // Bước 3: Đặt lại mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    if (!matKhauMoi || !xacNhanMatKhau) { setError('Vui lòng điền đầy đủ thông tin'); return }
    if (matKhauMoi !== xacNhanMatKhau) { setError('Mật khẩu xác nhận không khớp'); return }
    if (matKhauMoi.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự'); return }
    setLoading(true)
    try {
      const res = await authService.resetPassword(email.trim(), otp.trim(), matKhauMoi)
      setSuccess(res?.message || res?.Message || 'Đặt lại mật khẩu thành công')
      setStep(4)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.Message
      // Nếu OTP sai → quay về bước 2
      if (msg?.toLowerCase().includes('otp') || msg?.toLowerCase().includes('hết hạn')) {
        setStep(2)
        setOtp('')
      }
      setError(msg || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const stepTitles = ['', 'Quên mật khẩu', 'Xác nhận OTP', 'Mật khẩu mới', '']
  const stepDescs = ['', 'Nhập email của bạn để nhận mã OTP.', `Nhập mã 6 số đã gửi tới ${email}`, 'Tạo mật khẩu mới cho tài khoản của bạn.', '']

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg"
          alt="Cinema"
          className="absolute inset-0 w-full h-full object-cover object-center"
          onError={(e) => { e.target.style.display='none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/85 to-dark/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <h2 className="text-3xl font-bold text-white mb-3">Quên mật khẩu</h2>
          <p className="text-white/60 text-base leading-relaxed max-w-sm">
            Nhập email của bạn để nhận mã OTP và đặt lại mật khẩu.
          </p>
        </div>
      </div>

      {/* Right panel */}
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

          {step < 4 && (
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-1">{stepTitles[step]}</h1>
              <p className="text-white/40 text-sm">{stepDescs[step]}</p>
            </div>
          )}

          {/* Error / Success messages */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          {success && step === 2 && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3 mb-4">
              <p className="text-sm text-emerald-400">{success}</p>
            </div>
          )}

          {/* Bước 1: Nhập email */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="input-field"
                  autoComplete="email"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang gửi...</>
                ) : 'Gửi mã OTP'}
              </button>
            </form>
          )}

          {/* Bước 2: Nhập OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5" noValidate>
              <div>
                <OtpInput value={otp} onChange={setOtp} />
                <p className="text-white/30 text-xs mt-3 text-center">Kiểm tra hộp thư đến (và thư mục spam) của {email}</p>
              </div>
              <button
                type="submit"
                disabled={otp.replace(/\s/g,'').length !== 6}
                className="w-full btn-primary py-3 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Xác nhận OTP
              </button>
              <button
                type="button"
                onClick={() => { setStep(1); setOtp(''); setError(''); setSuccess('') }}
                className="w-full text-sm text-white/40 hover:text-white/70 transition-colors py-1"
              >
                Đổi email khác
              </button>
            </form>
          )}

          {/* Bước 3: Nhập mật khẩu mới */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showMK ? 'text' : 'password'}
                    value={matKhauMoi}
                    onChange={(e) => setMatKhauMoi(e.target.value)}
                    placeholder="Ít nhất 6 ký tự"
                    className="input-field pr-10"
                    autoComplete="new-password"
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowMK(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {showMK
                      ? <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Xác nhận mật khẩu</label>
                <div className="relative">
                  <input
                    type={showXN ? 'text' : 'password'}
                    value={xacNhanMatKhau}
                    onChange={(e) => setXacNhanMatKhau(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="input-field pr-10"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowXN(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {showXN
                      ? <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang xử lý...</>
                ) : 'Đặt lại mật khẩu'}
              </button>
            </form>
          )}

          {/* Bước 4: Thành công */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex flex-col items-center py-4">
                <div className="w-16 h-16 bg-emerald-700/50 rounded-full flex items-center justify-center mb-4 ring-4 ring-emerald-900/40">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">Đặt lại thành công!</h2>
                <p className="text-sm text-white/40 text-center">Mật khẩu của bạn đã được cập nhật. Đăng nhập ngay bây giờ.</p>
              </div>
              <Link to="/dang-nhap" className="block w-full text-center btn-primary py-3">
                Đăng nhập
              </Link>
            </div>
          )}

          {step < 4 && (
            <div className="mt-6 text-center text-sm text-white/40">
              <Link to="/dang-nhap" className="text-primary font-medium hover:text-primary-dark">
                Quay lại đăng nhập
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

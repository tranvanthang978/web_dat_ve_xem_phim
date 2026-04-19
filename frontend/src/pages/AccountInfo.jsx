import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function AccountInfo() {
  const { user, logout, login } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('info') // 'info' | 'password'
  const [form, setForm] = useState({ hoTen: '', email: '', soDienThoai: '', diaChi: '' })
  const [pwForm, setPwForm] = useState({ matKhauCu: '', matKhauMoi: '', xacNhan: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null) // { type: 'ok'|'err', text }

  useEffect(() => {
    if (!user) { navigate('/dang-nhap'); return }
    // Load thông tin mới nhất từ API
    api.get(`/nguoidung/${user.userId}`)
      .then(res => {
        const d = res.data?.data || res.data
        setForm({
          hoTen: d?.hoTen || user.hoTen || '',
          email: d?.email || user.email || '',
          soDienThoai: d?.soDienThoai || '',
          diaChi: d?.diaChi || '',
        })
      })
      .catch(() => {
        setForm({
          hoTen: user.hoTen || '',
          email: user.email || '',
          soDienThoai: '',
          diaChi: '',
        })
      })
  }, [user, navigate])

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3500)
  }

  const handleSaveInfo = async (e) => {
    e.preventDefault()
    if (!form.hoTen.trim()) { showMsg('err', 'Họ tên không được để trống'); return }
    setSaving(true)
    try {
      await api.put(`/nguoidung/${user.userId}`, { hoTen: form.hoTen, email: form.email, soDienThoai: form.soDienThoai })
      login({ ...user, hoTen: form.hoTen, email: form.email }, localStorage.getItem('token'))
      showMsg('ok', 'Cập nhật thông tin thành công!')
    } catch (e) {
      showMsg('err', e.response?.data?.message || 'Cập nhật thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!pwForm.matKhauCu || !pwForm.matKhauMoi) { showMsg('err', 'Vui lòng điền đầy đủ'); return }
    if (pwForm.matKhauMoi !== pwForm.xacNhan) { showMsg('err', 'Mật khẩu xác nhận không khớp'); return }
    setSaving(true)
    try {
      await api.put(`/nguoidung/${user.userId}/doi-mat-khau`, {
        matKhauCu: pwForm.matKhauCu,
        matKhauMoi: pwForm.matKhauMoi,
      })
      showMsg('ok', 'Đổi mật khẩu thành công!')
      setPwForm({ matKhauCu: '', matKhauMoi: '', xacNhan: '' })
    } catch (e) {
      showMsg('err', e.response?.data?.message || 'Đổi mật khẩu thất bại')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-10">
      <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">

          {/* ---- SIDEBAR ---- */}
          <aside className="md:w-[352px] shrink-0">
            <div className="bg-[#111] border border-white/5 rounded-2xl p-7 text-center mb-4">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-black mx-auto mb-4">
                {user.hoTen?.[0]?.toUpperCase() || 'U'}
              </div>
              <p className="text-sm font-bold text-white truncate">{user.hoTen}</p>
              <p className="text-xs text-white/40 truncate mt-0.5">{user.email}</p>
              <span className="inline-block mt-2 text-[11px] bg-white/8 text-white/50 border border-white/10 px-2.5 py-0.5 rounded-full">
                {user.vaiTro === 'Admin' ? 'Admin' : 'User'}
              </span>
            </div>

            <nav className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden min-h-[180px]">
              {[
                { key: 'info', label: 'Thông tin tài khoản', icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                )},
                { key: 'tickets', label: 'Vé của tôi', icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                )},
              ].map(item => (
                item.key === 'tickets'
                  ? <Link key={item.key} to="/ve-cua-toi"
                      className="flex items-center gap-3 px-5 py-4 text-sm text-white/50 hover:text-white hover:bg-white/8 active:bg-white/10 transition-all border-t border-white/5 group">
                      <span className="group-hover:text-primary transition-colors">{item.icon}</span>{item.label}
                    </Link>
                  : <button key={item.key} onClick={() => setTab('info')}
                      className={`w-full flex items-center gap-3 px-5 py-4 text-sm transition-all group ${
                        tab === 'info'
                          ? 'text-primary bg-primary/10 border-l-2 border-primary'
                          : 'text-white/50 hover:text-white hover:bg-white/8 border-l-2 border-transparent'
                      }`}>
                      {item.icon}{item.label}
                    </button>
              ))}
              <button
                onClick={() => { logout(); navigate('/dang-nhap') }}
                className="w-full flex items-center gap-3 px-5 py-4 text-sm text-white/40 hover:text-red-400 hover:bg-red-400/8 active:bg-red-400/12 transition-all border-t border-white/5 group"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Đăng xuất
              </button>
            </nav>
          </aside>

          {/* ---- MAIN ---- */}
          <div className="flex-1 min-w-0">
            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
              {/* Header + tabs */}
              <div className="px-6 pt-6 pb-0 border-b border-white/5">
                <h1 className="text-lg font-bold text-white mb-4">Thông tin tài khoản</h1>
                <div className="flex gap-1">
                  {[
                    { key: 'info', label: 'Thông tin cá nhân' },
                    { key: 'password', label: 'Đổi mật khẩu' },
                  ].map(t => (
                    <button key={t.key} onClick={() => { setTab(t.key); setMsg(null) }}
                      className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-all ${
                        tab === t.key
                          ? 'text-primary border-primary'
                          : 'text-white/40 border-transparent hover:text-white/70'
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* Message */}
                {msg && (
                  <div className={`mb-5 flex items-center gap-2 text-sm px-4 py-3 rounded-xl border ${
                    msg.type === 'ok'
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {msg.type === 'ok'
                      ? <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      : <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    }
                    {msg.text}
                  </div>
                )}

                {/* ---- TAB: Thông tin cá nhân ---- */}
                {tab === 'info' && (
                  <form onSubmit={handleSaveInfo} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Tên đăng nhập — readonly */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-white/50 mb-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          Tên đăng nhập
                        </label>
                        <input
                          type="text"
                          value={user.tenDangNhap || user.hoTen}
                          readOnly
                          className="w-full border border-white/8 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed select-none"
                          style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)' }}
                        />
                        <p className="text-[11px] text-white/25 mt-1">Không thể thay đổi</p>
                      </div>

                      {/* Họ và tên */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-white/50 mb-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          Họ và tên *
                        </label>
                        <input
                          type="text"
                          value={form.hoTen}
                          onChange={e => setForm(p => ({ ...p, hoTen: e.target.value }))}
                          className="input-field text-sm"
                          placeholder="Nhập họ và tên"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-white/50 mb-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          Email
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                          className="input-field text-sm"
                          placeholder="email@example.com"
                        />
                      </div>

                      {/* Số điện thoại */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-white/50 mb-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          value={form.soDienThoai}
                          onChange={e => setForm(p => ({ ...p, soDienThoai: e.target.value }))}
                          className="input-field text-sm"
                          placeholder="0901234567"
                        />
                      </div>
                    </div>

                    {/* Địa chỉ */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-medium text-white/50 mb-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Địa chỉ
                      </label>
                      <textarea
                        value={form.diaChi}
                        onChange={e => setForm(p => ({ ...p, diaChi: e.target.value }))}
                        rows={3}
                        className="input-field text-sm resize-none"
                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button type="submit" disabled={saving}
                        className="btn-primary px-6 py-2.5 text-sm font-bold disabled:opacity-50 flex items-center gap-2">
                        {saving
                          ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang lưu...</>
                          : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Lưu thay đổi</>
                        }
                      </button>
                    </div>
                  </form>
                )}

                {/* ---- TAB: Đổi mật khẩu ---- */}
                {tab === 'password' && (
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1.5">Mật khẩu hiện tại</label>
                      <input type="password" value={pwForm.matKhauCu}
                        onChange={e => setPwForm(p => ({ ...p, matKhauCu: e.target.value }))}
                        className="input-field text-sm" placeholder="••••••••" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1.5">Mật khẩu mới</label>
                      <input type="password" value={pwForm.matKhauMoi}
                        onChange={e => setPwForm(p => ({ ...p, matKhauMoi: e.target.value }))}
                        className="input-field text-sm" placeholder="••••••••" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1.5">Xác nhận mật khẩu mới</label>
                      <input type="password" value={pwForm.xacNhan}
                        onChange={e => setPwForm(p => ({ ...p, xacNhan: e.target.value }))}
                        className="input-field text-sm" placeholder="••••••••" />
                    </div>
                    <div className="pt-1">
                      <button type="submit" disabled={saving}
                        className="btn-primary px-6 py-2.5 text-sm font-bold disabled:opacity-50 flex items-center gap-2">
                        {saving
                          ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang lưu...</>
                          : 'Đổi mật khẩu'
                        }
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

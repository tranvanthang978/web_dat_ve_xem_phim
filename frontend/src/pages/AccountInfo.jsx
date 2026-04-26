import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import bookingService from '../services/bookingService'

export default function AccountInfo() {
  const { user, logout, login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') || 'info') // 'info' | 'password'
  const [form, setForm] = useState({ hoTen: '', email: '', soDienThoai: '', diaChi: '' })
  const [pwForm, setPwForm] = useState({ matKhauCu: '', matKhauMoi: '', xacNhan: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [showPwCu, setShowPwCu] = useState(false)
  const [showPwMoi, setShowPwMoi] = useState(false)
  const [showPwXn, setShowPwXn] = useState(false)
  const [tickets, setTickets] = useState([])
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [cancelling, setCancelling] = useState(null)
  const [ticketFilter, setTicketFilter] = useState('all')

  useEffect(() => {
    const urlTab = searchParams.get('tab')
    if (urlTab && ['info', 'password', 'tickets'].includes(urlTab)) setTab(urlTab)
  }, [searchParams])

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

  // Load tickets when tab = 'tickets'
  useEffect(() => {
    if (tab !== 'tickets' || !user?.userId) return
    setTicketsLoading(true)
    bookingService.getByUser(user.userId)
      .then(res => setTickets(Array.isArray(res) ? res : (res?.data || [])))
      .catch(() => setTickets([]))
      .finally(() => setTicketsLoading(false))
  }, [tab, user])

  const handleCancelTicket = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy vé này?')) return
    setCancelling(id)
    try {
      await bookingService.cancel(id)
      setTickets(prev => prev.map(t => t.id === id ? { ...t, trangThai: 'Cancelled' } : t))
    } catch { alert('Không thể hủy vé.') }
    finally { setCancelling(null) }
  }

  const fmtMoney = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n)) + 'đ'
  const fmtDate = (s) => new Date(s).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' })
  const fmtTime = (s) => new Date(s).toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit', hour12:false })
  const STATUS_MAP = {
    Pending:   { label: 'Chờ thanh toán', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
    Paid:      { label: 'Đã xác nhận',    color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20'  },
    Cancelled: { label: 'Đã hủy',         color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20'      },
    Refunded:  { label: 'Đã hoàn tiền',   color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20'    },
  }
  const filteredTickets = tickets.filter(t => {
    if (ticketFilter === 'upcoming') return t.trangThai === 'Paid' && new Date(t.gioBatDau) >= new Date()
    if (ticketFilter === 'past') return t.trangThai === 'Paid' && new Date(t.gioBatDau) < new Date()
    if (ticketFilter === 'pending') return t.trangThai === 'Pending'
    return true
  })

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
    if (pwForm.matKhauMoi.length < 6) { showMsg('err', 'Mật khẩu mới phải có ít nhất 6 ký tự'); return }
    if (!/[A-Za-z]/.test(pwForm.matKhauMoi) || !/[0-9]/.test(pwForm.matKhauMoi)) { showMsg('err', 'Mật khẩu mới phải chứa cả chữ và số'); return }
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
                { key: 'password', label: 'Đổi mật khẩu', icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                )},
                { key: 'tickets', label: 'Vé của tôi', icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                )},
              ].map((item, i) => (
                <button key={item.key} onClick={() => { setTab(item.key); setMsg(null) }}
                  className={`w-full flex items-center gap-3 px-5 py-4 text-sm transition-all group ${i > 0 ? 'border-t border-white/5' : ''} ${
                    tab === item.key
                      ? 'text-primary bg-primary/10 border-l-2 border-primary'
                      : 'text-white/50 hover:text-white hover:bg-white/8 border-l-2 border-transparent'
                  }`}>
                  <span className={tab === item.key ? 'text-primary' : 'group-hover:text-primary transition-colors'}>{item.icon}</span>{item.label}
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
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-white/5">
                <h1 className="text-lg font-bold text-white">
                  {tab === 'info' ? 'Thông tin cá nhân' : tab === 'password' ? 'Đổi mật khẩu' : 'Vé của tôi'}
                </h1>
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
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    {[
                      { label: 'Mật khẩu hiện tại', key: 'matKhauCu', show: showPwCu, setShow: setShowPwCu },
                      { label: 'Mật khẩu mới', key: 'matKhauMoi', show: showPwMoi, setShow: setShowPwMoi },
                      { label: 'Xác nhận mật khẩu mới', key: 'xacNhan', show: showPwXn, setShow: setShowPwXn },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-medium text-white/50 mb-1.5">{f.label}</label>
                        <div className="relative">
                          <input type={f.show ? 'text' : 'password'} value={pwForm[f.key]}
                            onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                            className="input-field text-sm pr-10" placeholder="••••••••" />
                          <button type="button" onClick={() => f.setShow(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                            {f.show
                              ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                              : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            }
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="pt-1">
                      <button type="submit" disabled={saving}
                        className="btn-primary px-6 py-2.5 text-sm font-bold disabled:opacity-50 flex items-center gap-2">
                        {saving
                          ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang lưu...</>
                          : <>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                              Đổi mật khẩu
                            </>
                        }
                      </button>
                    </div>
                  </form>
                )}

                {/* ---- TAB: Vé của tôi ---- */}
                {tab === 'tickets' && (
                  <div>
                    {/* Filter */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {[
                        { key: 'all', label: 'Tất cả' },
                        { key: 'upcoming', label: 'Sắp chiếu' },
                        { key: 'past', label: 'Đã chiếu' },
                        { key: 'pending', label: 'Chờ thanh toán' },
                      ].map(f => (
                        <button key={f.key} onClick={() => setTicketFilter(f.key)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                            ticketFilter === f.key
                              ? 'bg-primary/15 text-primary border-primary/30'
                              : 'bg-white/5 text-white/40 border-white/10 hover:text-white/70'
                          }`}>{f.label}</button>
                      ))}
                    </div>

                    {ticketsLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-3 border-white/10 border-t-primary rounded-full animate-spin" />
                      </div>
                    ) : filteredTickets.length === 0 ? (
                      <div className="text-center py-12 text-white/30">
                        <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                        <p className="text-sm">Chưa có vé nào</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredTickets.map(ticket => {
                          const status = STATUS_MAP[ticket.trangThai] || STATUS_MAP.Pending
                          const isOpen = expanded === ticket.id
                          const maDon = `TTA${String(ticket.id).padStart(6, '0')}`
                          const seats = (ticket.danhSachGhe || []).join(', ')
                          return (
                            <div key={ticket.id} className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
                              {/* Row */}
                              <button onClick={() => setExpanded(isOpen ? null : ticket.id)}
                                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-white truncate">{ticket.tenPhim}</p>
                                  <p className="text-xs text-white/40 mt-0.5">
                                    {fmtTime(ticket.gioBatDau)} • {fmtDate(ticket.gioBatDau)} • {ticket.tenRap}
                                  </p>
                                </div>
                                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
                                  {status.label}
                                </span>
                                <svg className={`w-4 h-4 text-white/30 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>

                              {/* Expanded detail */}
                              {isOpen && (
                                <div className="px-5 pb-5 border-t border-white/5">
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
                                    {[
                                      ['Mã đơn', maDon],
                                      ['Phòng', ticket.tenPhong],
                                      ['Ghế', seats],
                                      ['Tổng tiền', fmtMoney(ticket.tongTien)],
                                    ].map(([l, v]) => (
                                      <div key={l}>
                                        <p className="text-[11px] text-white/30 uppercase tracking-wide">{l}</p>
                                        <p className="text-sm font-semibold text-white mt-0.5">{v}</p>
                                      </div>
                                    ))}
                                  </div>

                                  {/* QR */}
                                  {ticket.trangThai === 'Paid' && (
                                    <div className="flex justify-center py-3">
                                      <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                                          `Mã đơn: ${maDon}\nPhim: ${ticket.tenPhim}\nRạp: ${ticket.tenRap}\nPhòng: ${ticket.tenPhong}\nSuất chiếu: ${fmtTime(ticket.gioBatDau)} - ${fmtDate(ticket.gioBatDau)}\nGhế: ${seats}`
                                        )}`}
                                        alt="QR" className="w-36 h-36 rounded-lg bg-white p-2"
                                      />
                                    </div>
                                  )}

                                  {/* Cancel button */}
                                  {ticket.trangThai === 'Pending' && (
                                    <button onClick={() => handleCancelTicket(ticket.id)}
                                      disabled={cancelling === ticket.id}
                                      className="mt-2 text-xs text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 px-4 py-2 rounded-lg transition-all disabled:opacity-50">
                                      {cancelling === ticket.id ? 'Đang hủy...' : 'Hủy vé'}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

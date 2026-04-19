import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import bookingService from '../services/bookingService'

const fmtMoney = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n)) + 'đ'
const fmtDate  = (s) => new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
const fmtTime  = (s) => {
  const d = new Date(s)
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const STATUS_MAP = {
  Pending:   { label: 'Chờ thanh toán', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
  Paid:      { label: 'Đã xác nhận',    color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20'  },
  Cancelled: { label: 'Đã hủy',         color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20'      },
  Refunded:  { label: 'Đã hoàn tiền',   color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20'    },
}

export default function MyTickets() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    if (!user?.userId) return
    bookingService.getByUser(user.userId)
      .then(res => setTickets(Array.isArray(res) ? res : (res?.data || [])))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false))
  }, [user])

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy vé này?')) return
    setCancelling(id)
    try {
      await bookingService.cancel(id)
      setTickets(prev => prev.map(t => t.id === id ? { ...t, trangThai: 'Cancelled' } : t))
    } catch {
      alert('Không thể hủy vé. Vui lòng thử lại.')
    } finally {
      setCancelling(null)
    }
  }

  const filtered = tickets.filter(t => {
    if (filter === 'upcoming') return t.trangThai === 'Paid' && new Date(t.gioBatDau) >= new Date()
    if (filter === 'past')     return t.trangThai === 'Paid' && new Date(t.gioBatDau) < new Date()
    if (filter === 'pending')  return t.trangThai === 'Pending'
    return true
  })

  return (
    <div className="min-h-screen bg-[#0A0C10]">
      {/* Header */}
      <div className="bg-[#0d0f14] border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-2 text-xs text-white/30 mb-4">
            <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-white/60">Vé của tôi</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-black text-white">Vé của tôi</h1>
              <p className="text-white/40 text-sm mt-1">
                Xin chào, <span className="text-white font-semibold">{user?.hoTen}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/30 text-xs">{tickets.length} vé</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { value: 'all',      label: 'Tất cả' },
            { value: 'upcoming', label: 'Sắp chiếu' },
            { value: 'past',     label: 'Đã xem' },
            { value: 'pending',  label: 'Chờ thanh toán' },
          ].map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                filter === f.value
                  ? 'bg-red-600 text-white'
                  : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/20'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <p className="text-white/30 text-sm mb-4">Chưa có vé nào</p>
            <Link to="/phim" className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors">
              Đặt vé ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(ticket => {
              const status = STATUS_MAP[ticket.trangThai] || STATUS_MAP.Pending
              const isExpanded = expanded === ticket.id
              const maDon = `TTA${String(ticket.id).padStart(6, '0')}`
              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(maDon)}`
              const isPaid = ticket.trangThai === 'Paid'
              const isPending = ticket.trangThai === 'Pending'
              const isCancelled = ticket.trangThai === 'Cancelled'
              const isUpcoming = isPaid && new Date(ticket.gioBatDau) >= new Date()

              return (
                <div key={ticket.id}
                  className={`bg-[#15171E] border rounded-2xl overflow-hidden transition-all ${
                    isExpanded ? 'border-white/15' : 'border-white/5 hover:border-white/10'
                  }`}>

                  {/* Card header — click to expand */}
                  <div className="p-5 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : ticket.id)}>
                    <div className="flex items-start gap-4">
                      {/* Left: info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-white font-bold text-base truncate">{ticket.tenPhim}</h3>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-white/40 text-xs mb-2">{ticket.tenRap} · {ticket.tenPhong}</p>
                        <div className="flex items-center gap-3 text-xs text-white/50 flex-wrap">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {fmtDate(ticket.gioBatDau)}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {fmtTime(ticket.gioBatDau)}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            {(ticket.danhSachGhe || []).join(', ')}
                          </span>
                        </div>
                      </div>

                      {/* Right: price + chevron */}
                      <div className="text-right shrink-0">
                        <p className="text-red-500 font-black text-base">{fmtMoney(ticket.tongTien)}</p>
                        <svg className={`w-4 h-4 text-white/30 mt-2 ml-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-white/5 p-5 bg-[#0d0f14]">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                        {/* Info */}
                        <div className="sm:col-span-2 space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Mã đơn</p>
                              <p className="text-red-500 font-bold font-mono">{maDon}</p>
                            </div>
                            <div>
                              <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Ngày đặt</p>
                              <p className="text-white">{fmtDate(ticket.ngayTao)}</p>
                            </div>
                            <div>
                              <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Ghế</p>
                              <p className="text-white font-semibold">{(ticket.danhSachGhe || []).join(', ')}</p>
                            </div>
                            <div>
                              <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Tổng tiền</p>
                              <p className="text-white font-bold">{fmtMoney(ticket.tongTien)}</p>
                            </div>
                            <div>
                              <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Rạp</p>
                              <p className="text-white">{ticket.tenRap}</p>
                            </div>
                            <div>
                              <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Phòng</p>
                              <p className="text-white">{ticket.tenPhong}</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2 flex-wrap">
                            {isPending && (
                              <Link to={`/dat-ve/${ticket.lichChieuId}`}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                                Thanh toán ngay
                              </Link>
                            )}
                            {(isPending || isUpcoming) && !isCancelled && (
                              <button
                                onClick={() => handleCancel(ticket.id)}
                                disabled={cancelling === ticket.id}
                                className="border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                                {cancelling === ticket.id ? 'Đang hủy...' : 'Hủy vé'}
                              </button>
                            )}
                            {!isPending && (
                              <Link to={`/phim`}
                                className="border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                                Đặt vé mới
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* QR */}
                        {isPaid && (
                          <div className="flex flex-col items-center gap-2">
                            <p className="text-white/30 text-xs uppercase tracking-wider">Xuất trình tại quầy</p>
                            <div className="bg-white p-2 rounded-xl">
                              <img src={qrUrl} alt={maDon} width={140} height={140} className="rounded-lg" />
                            </div>
                            <p className="text-red-500 font-bold text-xs font-mono">{maDon}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

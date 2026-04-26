import { useState, useEffect } from 'react'
import adminService from '../../services/adminService'
import Pagination from '../../components/Pagination'

const fmtDate  = (d) => new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const fmtMoney = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ'

const STATUS_MAP = {
  Pending:   { label: 'Chờ thanh toán', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  Paid:      { label: 'Đã thanh toán',  cls: 'bg-green-500/15 text-green-400 border-green-500/20'   },
  Cancelled: { label: 'Đã hủy',         cls: 'bg-red-500/15 text-red-400 border-red-500/20'         },
  Refunded:  { label: 'Đã hoàn tiền',   cls: 'bg-slate-500/15 text-slate-300 border-slate-500/20'   },
}

const STATUS_LABELS = {
  Pending:   'Chờ thanh toán',
  Paid:      'Đã thanh toán',
  Cancelled: 'Đã hủy',
  Refunded:  'Đã hoàn tiền',
}

const getAllowedStatusOptions = (currentStatus) => {
  if (currentStatus === 'Pending') return ['Pending', 'Paid', 'Cancelled']
  if (currentStatus === 'Paid')    return ['Paid', 'Refunded']
  return [currentStatus]
}

export default function AdminDatVe() {
  const [bookings, setBookings]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage]                 = useState(1)
  const pageSize = 10
  const [toast, setToast]               = useState(null) // { type: 'ok'|'err', text }
  const [detail, setDetail]             = useState(null) // booking đang xem chi tiết
  const [detailSaving, setDetailSaving] = useState(false)

  useEffect(() => {
    adminService.getAllBookings()
      .then(res => setBookings(Array.isArray(res.data) ? res.data : []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }, [])

  const showToast = (type, text) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 3000)
  }

  const filtered = bookings.filter(b => {
    const matchSearch = !search
      || b.tenPhim?.toLowerCase().includes(search.toLowerCase())
      || b.tenRap?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || b.trangThai === statusFilter
    return matchSearch && matchStatus
  })
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)

  const tongDoanhThu = bookings
    .filter(b => b.trangThai === 'Paid')
    .reduce((s, b) => s + b.tongTien, 0)

  // Cập nhật trạng thái từ modal chi tiết
  const handleDetailStatusChange = async (newStatus) => {
    if (!detail || newStatus === detail.trangThai) return
    setDetailSaving(true)
    try {
      const result = await adminService.updateBookingStatus(detail.id, { trangThai: newStatus })
      if (result.data?.success) {
        const updated = { ...detail, trangThai: newStatus }
        setBookings(prev => prev.map(b => b.id === detail.id ? updated : b))
        setDetail(updated)
        showToast('ok', 'Cập nhật trạng thái thành công')
      } else {
        showToast('err', result.data?.message || 'Không thể cập nhật trạng thái')
      }
    } catch {
      showToast('err', 'Lỗi kết nối, vui lòng thử lại')
    } finally {
      setDetailSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Đơn đặt vé</h1>
        <p className="text-sm text-white/40 mt-0.5">
          {bookings.length} đơn — Doanh thu:{' '}
          <span className="text-green-400">{fmtMoney(tongDoanhThu)}</span>
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border ${
          toast.type === 'ok'
            ? 'bg-green-500/10 text-green-400 border-green-500/20'
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {toast.text}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Tìm theo phim, rạp..."
            className="input-field text-sm pr-9 w-64"
          />
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="bg-[#1a1a1a] border border-white/10 text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="Pending">Chờ thanh toán</option>
          <option value="Paid">Đã thanh toán</option>
          <option value="Cancelled">Đã hủy</option>
          <option value="Refunded">Đã hoàn tiền</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Phim</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden md:table-cell">Rạp / Phòng</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden lg:table-cell">Ghế</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Tổng tiền</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Trạng thái</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden xl:table-cell">Ngày đặt</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-white/30">Không có đơn nào</td>
                </tr>
              ) : pageItems.map(b => {
                const st = STATUS_MAP[b.trangThai] || { label: b.trangThai, cls: 'bg-white/10 text-white/50 border-white/10' }
                return (
                  <tr key={b.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 text-white/40 font-mono text-xs">#{b.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white line-clamp-1">{b.tenPhim}</p>
                      <p className="text-xs text-white/30">{fmtDate(b.gioBatDau)}</p>
                    </td>
                    <td className="px-4 py-3 text-white/60 hidden md:table-cell">
                      <p>{b.tenRap}</p>
                      <p className="text-xs text-white/30">{b.tenPhong}</p>
                    </td>
                    <td className="px-4 py-3 text-white/60 hidden lg:table-cell text-xs">
                      {b.danhSachGhe?.join(', ')}
                    </td>
                    <td className="px-4 py-3 text-white font-semibold">{fmtMoney(b.tongTien)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full border ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs hidden xl:table-cell">{fmtDate(b.ngayTao)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDetail(b)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors whitespace-nowrap"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      <Pagination page={page} pageSize={pageSize} total={filtered.length} onChange={setPage} />

      {/* Modal chi tiết đơn đặt vé */}
      {detail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div>
                <h2 className="text-base font-bold text-white">Chi tiết đơn đặt vé</h2>
                <p className="text-xs text-white/40 mt-0.5 font-mono">
                  #{detail.id} — TTA{String(detail.id).padStart(6, '0')}
                </p>
              </div>
              <button onClick={() => setDetail(null)} className="text-white/40 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Thông tin phim */}
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Phim</p>
                  <p className="text-white font-semibold">{detail.tenPhim}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Rạp</p>
                    <p className="text-white/80 text-sm">{detail.tenRap}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Phòng</p>
                    <p className="text-white/80 text-sm">{detail.tenPhong}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Suất chiếu</p>
                    <p className="text-white/80 text-sm">{fmtDate(detail.gioBatDau)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Ghế</p>
                    <p className="text-white/80 text-sm">{detail.danhSachGhe?.join(', ') || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Thông tin đơn */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Tổng tiền</p>
                  <p className="text-primary font-bold text-lg">{fmtMoney(detail.tongTien)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Ngày đặt</p>
                  <p className="text-white/80 text-sm">{fmtDate(detail.ngayTao)}</p>
                </div>
              </div>

              {/* Đổi trạng thái */}
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Trạng thái đơn</p>
                <div className="flex items-center gap-3">
                  {/* Badge trạng thái hiện tại */}
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                    (STATUS_MAP[detail.trangThai] || { cls: 'bg-white/10 text-white/50 border-white/10' }).cls
                  }`}>
                    {STATUS_LABELS[detail.trangThai] || detail.trangThai}
                  </span>

                  {/* Dropdown chuyển trạng thái — chỉ hiện nếu còn options khác */}
                  {getAllowedStatusOptions(detail.trangThai).length > 1 && (
                    <div className="flex items-center gap-2 flex-1">
                      <svg className="w-4 h-4 text-white/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      <select
                        value={detail.trangThai}
                        onChange={e => handleDetailStatusChange(e.target.value)}
                        disabled={detailSaving}
                        className="flex-1 bg-[#111] border border-white/10 text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                      >
                        {getAllowedStatusOptions(detail.trangThai).map(s => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                      {detailSaving && (
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin shrink-0" />
                      )}
                    </div>
                  )}
                </div>

                {/* Ghi chú quy tắc chuyển trạng thái */}
                <p className="text-xs text-white/25 mt-2">
                  {detail.trangThai === 'Pending' && 'Có thể chuyển sang: Đã thanh toán hoặc Đã hủy'}
                  {detail.trangThai === 'Paid' && 'Có thể chuyển sang: Đã hoàn tiền'}
                  {(detail.trangThai === 'Cancelled' || detail.trangThai === 'Refunded') && 'Trạng thái này không thể thay đổi'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <button
                onClick={() => setDetail(null)}
                className="w-full btn-outline text-sm py-2.5"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

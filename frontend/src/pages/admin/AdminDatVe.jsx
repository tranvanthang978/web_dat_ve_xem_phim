import { useState, useEffect } from 'react'
import adminService from '../../services/adminService'
import Pagination from '../../components/Pagination'

const fmtDate = (d) => new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const fmtMoney = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ'

const STATUS_MAP = {
  Pending: { label: 'Chờ thanh toán', cls: 'bg-yellow-500/15 text-yellow-400' },
  Paid: { label: 'Đã thanh toán', cls: 'bg-green-500/15 text-green-400' },
  Cancelled: { label: 'Đã hủy', cls: 'bg-red-500/15 text-red-400' },
  Refunded: { label: 'Đã hoàn tiền', cls: 'bg-slate-500/15 text-slate-300' },
}

const STATUS_LABELS = {
  Pending: 'Chờ thanh toán',
  Paid: 'Đã thanh toán',
  Cancelled: 'Đã hủy',
  Refunded: 'Đã hoàn tiền',
}

const getAllowedStatusOptions = (currentStatus) => {
  if (currentStatus === 'Pending') {
    return ['Pending', 'Paid', 'Cancelled']
  }
  if (currentStatus === 'Paid') {
    return ['Paid', 'Refunded']
  }
  return [currentStatus]
}

export default function AdminDatVe() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    adminService.getAllBookings()
      .then(res => setBookings(res.data?.data || res.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = bookings.filter(b => {
    const matchSearch = !search || b.tenPhim?.toLowerCase().includes(search.toLowerCase()) || b.tenRap?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || b.trangThai === statusFilter
    return matchSearch && matchStatus
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  const tongDoanhThu = bookings.filter(b => b.trangThai === 'Paid').reduce((s, b) => s + b.tongTien, 0)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Đơn đặt vé</h1>
        <p className="text-sm text-white/40 mt-0.5">{bookings.length} đơn — Doanh thu: <span className="text-green-400">{fmtMoney(tongDoanhThu)}</span></p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo phim, rạp..."
            className="input-field text-sm pr-9 w-64"
          />
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-white/30">Không có đơn nào</td></tr>
              ) : pageItems.map(b => {
                const st = STATUS_MAP[b.trangThai] || { label: b.trangThai, cls: 'bg-white/10 text-white/50' }
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
                    <td className="px-4 py-3 text-white/60 hidden lg:table-cell text-xs">{b.danhSachGhe?.join(', ')}</td>
                    <td className="px-4 py-3 text-white font-semibold">{fmtMoney(b.tongTien)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={b.trangThai}
                        onChange={async (e) => {
                          const newStatus = e.target.value
                          if (newStatus === b.trangThai) return
                          const result = await adminService.updateBookingStatus(b.id, { trangThai: newStatus })
                          if (result.data?.success) {
                            setBookings(prev => prev.map(item => item.id === b.id ? { ...item, trangThai: newStatus } : item))
                            alert('Cập nhật trạng thái thành công')
                          } else {
                            alert(result.data?.message || 'Không thể cập nhật trạng thái')
                          }
                        }}
                        className="bg-[#14161c] border border-white/10 text-xs text-white rounded-lg px-2 py-1"
                      >
                        {getAllowedStatusOptions(b.trangThai).map(status => (
                          <option key={status} value={status}>{STATUS_LABELS[status] || status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs hidden xl:table-cell">{fmtDate(b.ngayTao)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      <Pagination page={page} pageSize={pageSize} total={filtered.length} onChange={setPage} />
    </div>
  )
}


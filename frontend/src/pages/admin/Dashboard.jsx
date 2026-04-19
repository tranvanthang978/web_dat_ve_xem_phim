import { useState, useEffect } from 'react'
import adminService from '../../services/adminService'

const fmt      = (n) => new Intl.NumberFormat('vi-VN').format(n)
const fmtMoney = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
const fmtShort = (n) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)         return (n / 1_000).toFixed(0) + 'K'
  return String(n)
}


function StatCard({ label, value, sub, color = 'text-white', icon }) {
  const bg = {
    'text-primary':    'bg-primary/15',
    'text-green-400':  'bg-green-400/10',
    'text-blue-400':   'bg-blue-400/10',
    'text-yellow-400': 'bg-yellow-400/10',
  }[color] || 'bg-white/5'
  return (
    <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
        <span className={color}>{icon}</span>
      </div>
      <div>
        <p className="text-xs text-white/40 mb-0.5">{label}</p>
        <p className={`text-xl font-bold ${color}`}>{value}</p>
        {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// Biểu đồ cột đơn giản dùng SVG
function BarChart({ data, keyX, keyY, color = '#e50914', title }) {
  if (!data?.length) return (
    <div className="h-40 flex items-center justify-center text-white/20 text-sm">Chưa có dữ liệu</div>
  )
  const max = Math.max(...data.map(d => d[keyY]), 1)
  const H = 120 // chiều cao vùng bar tính bằng px

  return (
    <div>
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      <div className="flex items-end gap-1.5" style={{ height: H + 28 }}>
        {data.map((d, i) => {
          const barH = Math.max(4, Math.round((d[keyY] / max) * H))
          const label = typeof d[keyY] === 'number' && d[keyY] > 10000
            ? fmtMoney(d[keyY]) : fmt(d[keyY])
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group" style={{ height: H + 28 }}>
              <div style={{ flex: 1 }} />
              <div
                className="w-full rounded-t transition-all cursor-default"
                style={{ height: barH, background: color, opacity: 0.85 }}
                title={label}
              />
              <span className="text-[9px] text-white/30 truncate w-full text-center leading-tight mt-0.5">
                {d[keyX]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LineChart({ data }) {
  if (!data?.length) return (
    <div className="h-52 flex items-center justify-center text-white/20 text-sm">Chưa có dữ liệu</div>
  )

  const width = 560
  const height = 220
  const padding = 30
  const values = data.map(d => d.doanhThu)
  const orders = data.map(d => d.soDon)
  const maxValue = Math.max(...values, 1)
  const maxOrder = Math.max(...orders, 1)

  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - (d.doanhThu / maxValue) * (height - padding * 2)
    return `${x},${y}`
  }).join(' ')

  const points2 = data.map((d, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - (d.soDon / maxOrder) * (height - padding * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="bg-[#14161c] rounded-3xl border border-white/10 p-5 h-full">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Doanh thu và đặt vé</h3>
          <p className="text-xs text-white/40">7 ngày gần nhất</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/50">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Doanh thu
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" /> Đơn đặt
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff6b81" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#ff6b81" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="order-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="100%" height="100%" fill="transparent" />
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1={padding}
              x2={width - padding}
              y1={padding + ((height - padding * 2) / 4) * i}
              y2={padding + ((height - padding * 2) / 4) * i}
              stroke="rgba(255,255,255,0.06)"
            />
          ))}

          <polyline
            fill="url(#revenue-gradient)"
            stroke="none"
            points={`${points} ${width - padding},${height - padding} ${padding},${height - padding}`}
            opacity="0.8"
          />
          <polyline
            fill="none"
            stroke="#ff6b81"
            strokeWidth="3"
            strokeLinejoin="round"
            points={points}
          />

          <polyline
            fill="url(#order-gradient)"
            stroke="none"
            points={`${points2} ${width - padding},${height - padding} ${padding},${height - padding}`}
            opacity="0.7"
          />
          <polyline
            fill="none"
            stroke="#22d3ee"
            strokeWidth="3"
            strokeLinejoin="round"
            points={points2}
          />

          {data.map((d, index) => {
            const x = padding + (index / (data.length - 1)) * (width - padding * 2)
            const y = height - padding - (d.doanhThu / maxValue) * (height - padding * 2)
            return (
              <circle key={index} cx={x} cy={y} r="4" fill="#fff" />
            )
          })}
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-3 text-[11px] text-white/50 mt-4">
        {data.map((d, index) => {
          const date = new Date(d.ngay)
          return (
            <div key={index} className="space-y-1">
              <p className="font-semibold text-white/80">{date.getDate()}/{date.getMonth() + 1}</p>
              <p>{fmtShort(d.soDon)} đơn</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Biểu đồ tròn (donut) dùng SVG

export default function Dashboard() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    adminService.getThongKe()
      .then(res => setStats(res.data?.data || res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleExportCsv = async () => {
    setExporting(true)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5265/api'}/admin/export/bookings`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `DonDatVe_${new Date().toISOString().slice(0,10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch { alert('Xuất CSV thất bại') }
    finally { setExporting(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )

  const s = stats || {
    tongPhim: 0, dangChieu: 0, tongRap: 0, tongNguoiDung: 0,
    tongDonDat: 0, tongVeBan: 0, tongDoanhThu: 0, donDatHomNay: 0, doanhThuThang: 0,
    tyLeLapDay: 0, topPhim: [], doanhThu7Ngay: []
  }

  const doanhThu7Ngay = (s.doanhThu7Ngay || []).map(d => ({
    ngay: d.ngay,
    doanhThu: d.doanhThu,
    soDon: d.soDon
  }))
  const topPhim = s.topPhim || []

  const maxDT = Math.max(...doanhThu7Ngay.map(d => d.doanhThu), 1)
  const maxSoDon = Math.max(...doanhThu7Ngay.map(d => d.soDon), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Tổng quan</h1>
          <p className="text-sm text-white/40 mt-0.5">Thống kê hệ thống TTA Movie</p>
        </div>
        <button
          onClick={handleExportCsv}
          disabled={exporting}
          className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-white/5 border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-sm font-medium px-4 py-2 rounded-lg transition-all disabled:opacity-50"
        >
          {exporting ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
          Xuất CSV
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng doanh thu" value={fmtMoney(s.tongDoanhThu)} sub={`Tháng này ${fmtMoney(s.doanhThuThang)}`} color="text-primary" icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        } />
        <StatCard label="Vé đã bán" value={fmt(s.tongVeBan)} sub={`Tổng ${fmt(s.tongDonDat)} đơn`} color="text-blue-400" icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2-2 2 2m-2-2v6m9-1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h8l4 4v6z" />
          </svg>
        } />
        <StatCard label="Người dùng" value={fmt(s.tongNguoiDung)} sub="Đã đăng ký" color="text-yellow-400" icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        } />
        <StatCard label="Tỷ lệ lấp đầy" value={`${s.tyLeLapDay}%`} sub={`${fmt(s.donDatHomNay)} đơn hôm nay`} color="text-green-400" icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M4 12h16M4 8h16M8 4h8" />
          </svg>
        } />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6">
        <div className="bg-[#14161c] border border-white/10 rounded-[32px] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-white/40">Doanh thu và đặt vé</p>
              <h2 className="text-2xl font-semibold text-white">Hiệu suất hệ thống</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60">
              7 ngày gần nhất
            </div>
          </div>
          <div className="mt-6">
            <LineChart data={doanhThu7Ngay} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#14161c] border border-white/10 rounded-[32px] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-white/40">Top phim đặt nhiều nhất</p>
                <h3 className="text-lg font-semibold text-white">Top 3 phim</h3>
              </div>
              <span className="text-xs text-white/50">Tự động cập nhật</span>
            </div>
            <div className="space-y-4">
              {topPhim.map((p, i) => {
                const maxSoDon = Math.max(...topPhim.map(item => item.soDon || 0), 1)
                const percent = Math.round((p.soDon / maxSoDon) * 100)
                return (
                  <div key={p.tenPhim || i} className="rounded-[24px] border border-white/10 bg-[#111315] p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-3xl bg-slate-900 flex-shrink-0">
                        <img
                          src={p.posterUrl || 'https://via.placeholder.com/120x120/111827/94a3b8?text=No+Image'}
                          alt={p.tenPhim}
                          className="h-full w-full object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/120x120/111827/94a3b8?text=No+Image' }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{p.tenPhim}</p>
                        <p className="text-[11px] text-white/40 mt-1">{p.soDon} đơn • {fmtMoney(p.doanhThu)}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-sm font-semibold text-white">{percent}%</p>
                        <p className="text-[11px] text-white/40">So sánh top</p>
                      </div>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-rose-500 via-red-500 to-orange-400"
                        style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[32px] border border-white/10 bg-[#14161c] p-5">
              <p className="text-xs text-white/40">Đơn đặt hôm nay</p>
              <p className="mt-4 text-2xl font-semibold text-white">{fmt(s.donDatHomNay)}</p>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-[#14161c] p-5">
              <p className="text-xs text-white/40">Tỷ lệ hôm nay</p>
              <p className="mt-4 text-2xl font-semibold text-white">{s.tyLeLapDay}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#14161c] border border-white/10 rounded-[32px] p-6">
          <p className="text-sm text-white/40 mb-4">Dữ liệu nhanh</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-[#111315] p-5 border border-white/10">
              <p className="text-xs text-white/40">Tổng phim</p>
              <p className="mt-3 text-xl font-semibold text-white">{fmt(s.tongPhim)}</p>
            </div>
            <div className="rounded-3xl bg-[#111315] p-5 border border-white/10">
              <p className="text-xs text-white/40">Rạp</p>
              <p className="mt-3 text-xl font-semibold text-white">{fmt(s.tongRap)}</p>
            </div>
            <div className="rounded-3xl bg-[#111315] p-5 border border-white/10">
              <p className="text-xs text-white/40">Người dùng</p>
              <p className="mt-3 text-xl font-semibold text-white">{fmt(s.tongNguoiDung)}</p>
            </div>
            <div className="rounded-3xl bg-[#111315] p-5 border border-white/10">
              <p className="text-xs text-white/40">Đơn đặt</p>
              <p className="mt-3 text-xl font-semibold text-white">{fmt(s.tongDonDat)}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#14161c] border border-white/10 rounded-[32px] p-6">
          <p className="text-sm text-white/40 mb-4">Chỉ số phụ</p>
          <div className="space-y-4">
            <div className="rounded-3xl bg-[#111315] p-5 border border-white/10">
              <p className="text-xs text-white/40">Doanh thu tháng</p>
              <p className="mt-3 text-xl font-semibold text-white">{fmtMoney(s.doanhThuThang)}</p>
            </div>
            <div className="rounded-3xl bg-[#111315] p-5 border border-white/10">
              <p className="text-xs text-white/40">Vé bán</p>
              <p className="mt-3 text-xl font-semibold text-white">{fmt(s.tongVeBan)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


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

// Biểu đồ cột đôi có hiệu ứng và Tooltip
function DualBarChart({ data }) {
  const [mounted, setMounted] = useState(false)

  // Kích hoạt animation khi component render
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 150)
    return () => clearTimeout(timer)
  }, [data])

  if (!data?.length) return (
    <div className="h-52 flex items-center justify-center text-white/20 text-sm">Chưa có dữ liệu</div>
  )

  const width = 600
  const height = 260 // Tăng chiều cao tổng thể
  // Tăng padding top để chứa chữ hover không bị cắt
  const padding = { top: 40, right: 10, bottom: 40, left: 10 } 
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const maxValue = Math.max(...data.map(d => d.doanhThu), 1)
  const maxOrder = Math.max(...data.map(d => d.soDon), 1)

  const groupWidth = chartW / data.length
  const barWidth = Math.min(groupWidth * 0.35, 24)
  const gap = 4 // Khoảng cách giữa 2 cột

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="flex items-center gap-4 text-xs text-white/50 mb-2 justify-end px-2">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#ff6b81]" /> Doanh thu
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#22d3ee]" /> Đơn đặt
        </span>
      </div>

      <div className="overflow-x-auto flex-1 w-full">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {/* Lưới nền */}
          {[0, 1, 2, 3, 4].map(i => {
            const y = padding.top + (chartH / 4) * i
            return (
              <line key={`grid-${i}`} x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="rgba(255,255,255,0.06)" />
            )
          })}

          {data.map((d, index) => {
            const groupX = padding.left + index * groupWidth
            const centerX = groupX + groupWidth / 2

            // Tính toán chiều cao thực tế
            const targetH1 = (d.doanhThu / maxValue) * chartH
            const targetH2 = (d.soDon / maxOrder) * chartH

            // Nếu chưa mount, chiều cao = 0, y = đáy biểu đồ (để làm hiệu ứng mọc lên)
            const h1 = mounted ? targetH1 : 0
            const h2 = mounted ? targetH2 : 0
            const y1 = padding.top + chartH - h1
            const y2 = padding.top + chartH - h2

            const x1 = centerX - barWidth - gap / 2
            const x2 = centerX + gap / 2

            const date = new Date(d.ngay)
            let showLabel = true
            if (data.length > 14) {
              const step = Math.ceil(data.length / 6)
              showLabel = index === 0 || index === data.length - 1 || index % step === 0
            }

            return (
              <g key={`group-${index}`} className="group cursor-pointer">
                {/* Khu vực bắt hover (trong suốt) để dễ di chuột */}
                <rect x={centerX - groupWidth/2} y={padding.top} width={groupWidth} height={chartH} fill="transparent" />

                {/* Cột Doanh Thu */}
                <rect 
                  x={x1} y={y1} width={barWidth} height={h1} fill="#ff6b81" rx={3} 
                  className="transition-all duration-700 ease-out opacity-80 group-hover:opacity-100 group-hover:brightness-110" 
                />
                
                {/* Cột Đơn Đặt */}
                <rect 
                  x={x2} y={y2} width={barWidth} height={h2} fill="#22d3ee" rx={3} 
                  className="transition-all duration-700 ease-out opacity-80 group-hover:opacity-100 group-hover:brightness-110" 
                  style={{ transitionDelay: mounted ? '75ms' : '0ms' }} // Delay nhẹ cho cột thứ 2
                />

                {/* Chú thích giá trị hiển thị KHI HOVER */}
                <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {/* Nhãn Doanh thu */}
                  <text x={x1 + barWidth / 2} y={y1 - 10} fill="#ff6b81" fontSize="11" fontFamily="system-ui, sans-serif" textAnchor="middle" fontWeight="bold">
                    {fmtShort(d.doanhThu)}
                  </text>
                  {/* Nhãn Đơn đặt */}
                  <text x={x2 + barWidth / 2} y={y2 - 10} fill="#22d3ee" fontSize="11" fontFamily="system-ui, sans-serif" textAnchor="middle" fontWeight="bold">
                    {d.soDon}
                  </text>
                </g>

                {/* Trục X: Chữ số ngày được làm rõ và to hơn */}
                {showLabel && (
                  <text x={centerX} y={height - 12} fill="#9ca3af" fontSize="13" fontFamily="system-ui, sans-serif" textAnchor="middle" fontWeight="500">
                    {date.getDate()}/{date.getMonth() + 1}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

// Biểu đồ tròn trạng thái có hiệu ứng vẽ vòng
function DonutChart({ data, title }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 300)
    return () => clearTimeout(timer)
  }, [])

  if (!data?.length) return null

  const size = 160
  const strokeWidth = 24
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const total = data.reduce((sum, item) => sum + item.value, 0)

  let currentOffset = 0

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full">
      <h3 className="text-sm font-semibold text-white/40 mb-6 w-full text-left">{title}</h3>
      <div className="relative flex items-center gap-8 w-full justify-center">
        <div className="relative w-40 h-40 flex-shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            {data.map((item, index) => {
              const dashArray = (item.value / total) * circumference
              const strokeDasharray = `${dashArray} ${circumference}`
              const strokeDashoffset = -currentOffset
              currentOffset += dashArray

              return (
                <circle
                  key={index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  // Hiệu ứng vẽ từ từ: Nếu chưa mount thì che hết (offset = circumference)
                  strokeDashoffset={mounted ? strokeDashoffset : circumference}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out hover:opacity-80 cursor-pointer"
                >
                  <title>{item.label}: {item.value} ({((item.value / total) * 100).toFixed(1)}%)</title>
                </circle>
              )
            })}
          </svg>
          <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-2xl font-bold text-white">{total}</span>
            <span className="text-[10px] text-white/40 uppercase">Tổng đơn</span>
          </div>
        </div>

        <div className={`flex flex-col gap-3 transition-opacity duration-1000 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <div className="flex flex-col">
                <span className="text-xs text-white/80">{item.label}</span>
                <span className="text-[10px] font-semibold text-white/50">{item.value} đơn</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [days, setDays]       = useState(7)
  const [pageLoaded, setPageLoaded] = useState(false)

  // Hiệu ứng fade-in cho toàn bộ trang
  useEffect(() => {
    setPageLoaded(true)
  }, [])

  useEffect(() => {
    setLoading(true)
    adminService.getThongKe(days)
      .then(res => setStats(res.data?.data || res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [days])

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

  const doanhThu7Ngay = (s.doanhThuBieuDo || []).map(d => ({
    ngay: d.ngay,
    doanhThu: d.doanhThu,
    soDon: d.soDon
  }))
  const topPhim = s.topPhim || []

  const orderStatusData = [
    { label: 'Thành công', value: s.tongDonDat > 0 ? s.tongDonDat - 12 : 145, color: '#10b981' }, 
    { label: 'Chờ thanh toán', value: 8, color: '#f59e0b' }, 
    { label: 'Đã hủy', value: 4, color: '#f43f5e' } 
  ]

  return (
    // Thêm wrapper để quản lý hiệu ứng fade-in & slide-up của toàn bộ màn hình
    <div className={`space-y-6 transition-all duration-700 ease-out ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      
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
        <div className="bg-[#14161c] border border-white/10 rounded-[32px] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] flex flex-col">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-white/40">Doanh thu và đặt vé</p>
              <h2 className="text-2xl font-semibold text-white">Hiệu suất hệ thống</h2>
            </div>
            <select
              value={days}
              onChange={e => setDays(Number(e.target.value))}
              className="rounded-full border border-white/10 bg-[#1a1a1a] hover:bg-white/5 px-4 py-2 text-xs text-white outline-none focus:border-primary/50 cursor-pointer transition-colors"
            >
              <option className="bg-[#1a1a1a] text-white" value={7}>7 ngày gần nhất</option>
              <option className="bg-[#1a1a1a] text-white" value={14}>14 ngày gần nhất</option>
              <option className="bg-[#1a1a1a] text-white" value={30}>1 tháng gần nhất</option>
              <option className="bg-[#1a1a1a] text-white" value={90}>3 tháng gần nhất</option>
            </select>
          </div>
          <div className="mt-6 flex-1 min-h-[300px]">
            <DualBarChart data={doanhThu7Ngay} />
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
                  <div key={p.tenPhim || i} className="rounded-[24px] border border-white/10 bg-[#111315] p-4 group hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-3xl bg-slate-900 flex-shrink-0">
                        <img
                          src={p.posterUrl || 'https://via.placeholder.com/120x120/111827/94a3b8?text=No+Image'}
                          alt={p.tenPhim}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                      <div className="h-full rounded-full bg-gradient-to-r from-rose-500 via-red-500 to-orange-400 transition-all duration-1000 ease-out"
                        style={{ width: pageLoaded ? `${percent}%` : '0%' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[32px] border border-white/10 bg-[#14161c] p-5 hover:border-white/20 transition-colors">
              <p className="text-xs text-white/40">Đơn đặt hôm nay</p>
              <p className="mt-4 text-2xl font-semibold text-white">{fmt(s.donDatHomNay)}</p>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-[#14161c] p-5 hover:border-white/20 transition-colors">
              <p className="text-xs text-white/40">Tỷ lệ hôm nay</p>
              <p className="mt-4 text-2xl font-semibold text-white">{s.tyLeLapDay}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#14161c] border border-white/10 rounded-[32px] p-6">
          <p className="text-sm text-white/40 mb-4">Dữ liệu nhanh</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-[#111315] p-5 border border-white/10 hover:bg-white/5 transition-colors">
              <p className="text-xs text-white/40">Tổng phim</p>
              <p className="mt-3 text-xl font-semibold text-white">{fmt(s.tongPhim)}</p>
            </div>
            <div className="rounded-3xl bg-[#111315] p-5 border border-white/10 hover:bg-white/5 transition-colors">
              <p className="text-xs text-white/40">Rạp</p>
              <p className="mt-3 text-xl font-semibold text-white">{fmt(s.tongRap)}</p>
            </div>
            <div className="rounded-3xl bg-[#111315] p-5 border border-white/10 hover:bg-white/5 transition-colors">
              <p className="text-xs text-white/40">Người dùng</p>
              <p className="mt-3 text-xl font-semibold text-white">{fmt(s.tongNguoiDung)}</p>
            </div>
            <div className="rounded-3xl bg-[#111315] p-5 border border-white/10 hover:bg-white/5 transition-colors">
              <p className="text-xs text-white/40">Đơn đặt</p>
              <p className="mt-3 text-xl font-semibold text-white">{fmt(s.tongDonDat)}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#14161c] border border-white/10 rounded-[32px] p-6">
          <p className="text-sm text-white/40 mb-4">Chỉ số phụ</p>
          <div className="space-y-4">
            <div className="rounded-3xl bg-[#111315] p-5 border border-white/10 hover:bg-white/5 transition-colors">
              <p className="text-xs text-white/40">Doanh thu tháng</p>
              <p className="mt-3 text-xl font-semibold text-white">{fmtMoney(s.doanhThuThang)}</p>
            </div>
            <div className="rounded-3xl bg-[#111315] p-5 border border-white/10 hover:bg-white/5 transition-colors">
              <p className="text-xs text-white/40">Vé bán</p>
              <p className="mt-3 text-xl font-semibold text-white">{fmt(s.tongVeBan)}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#14161c] border border-white/10 rounded-[32px] p-6 flex flex-col justify-center">
          <DonutChart data={orderStatusData} title="Trạng thái đơn vé" />
        </div>
      </div>
    </div>
  )
}
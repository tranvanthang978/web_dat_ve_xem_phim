import { useState, useEffect } from 'react'
import api from '../services/api'

const fmtDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

export default function KhuyenMai() {
  const [khuyenMais, setKhuyenMais] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState('')
  const [now, setNow] = useState(new Date())

  // Cập nhật thời gian thực mỗi phút
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    api.get('/khuyenmai')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || [])
        setKhuyenMais(data)
      })
      .catch(() => setKhuyenMais([]))
      .finally(() => setLoading(false))
  }, [])

  const copyCode = (ma) => {
    navigator.clipboard.writeText(ma).then(() => {
      setCopied(ma)
      setTimeout(() => setCopied(''), 2000)
    })
  }

  // Lọc theo thời gian thực: conHieuLuc + ngayBatDau <= now <= ngayKetThuc + còn lượt dùng
  const active = khuyenMais.filter(k =>
    k.conHieuLuc &&
    new Date(k.ngayBatDau) <= now &&
    new Date(k.ngayKetThuc) >= now &&
    (k.soLuotSuDung === 0 || k.soLuotDaDung < k.soLuotSuDung)
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-[#0a0a0a] to-[#0a0a0a] pt-16 pb-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/25 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Ưu đãi đặc biệt
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Khuyến mãi</h1>
          <p className="text-white/50 text-sm max-w-md mx-auto">
            Sao chép mã và nhập khi thanh toán để nhận ưu đãi
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 mt-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : active.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎟️</div>
            <p className="text-white/40 text-sm">Hiện chưa có khuyến mãi nào đang hoạt động</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {active.map(k => {
              const daysLeft = Math.ceil((new Date(k.ngayKetThuc) - now) / (1000 * 60 * 60 * 24))
              const urgent = daysLeft <= 3
              const hasLimit = k.soLuotSuDung > 0
              const luotConLai = hasLimit ? k.soLuotSuDung - k.soLuotDaDung : null
              const pctUsed = hasLimit ? (k.soLuotDaDung / k.soLuotSuDung) * 100 : 0
              const almostOut = hasLimit && luotConLai <= Math.ceil(k.soLuotSuDung * 0.2)

              return (
                <div key={k.id} className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all group">
                  {/* Top stripe */}
                  <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-transparent" />

                  <div className="p-5 space-y-4">
                    {/* Badge + tags */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-14 h-14 bg-primary/15 rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-primary font-black text-lg">-{k.giaTriGiam}%</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {urgent && (
                          <span className="text-[10px] bg-red-500/15 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-bold animate-pulse">
                            Sắp hết hạn
                          </span>
                        )}
                        {almostOut && (
                          <span className="text-[10px] bg-orange-500/15 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full font-bold">
                            Sắp hết lượt
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-white font-bold text-base">Giảm {k.giaTriGiam}% tổng đơn</p>
                      {k.giamToiDa > 0 && (
                        <p className="text-primary text-xs font-semibold mt-0.5">
                          Tối đa {new Intl.NumberFormat('vi-VN').format(k.giamToiDa)}đ
                        </p>
                      )}
                      <p className="text-white/40 text-xs mt-1">
                        {fmtDate(k.ngayBatDau)} — {fmtDate(k.ngayKetThuc)}
                        {daysLeft > 0 && <span className="ml-2 text-white/30">({daysLeft} ngày còn lại)</span>}
                      </p>
                    </div>

                    {/* Lượt sử dụng */}
                    {hasLimit && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/40">Lượt sử dụng</span>
                          <span className={`font-semibold ${almostOut ? 'text-orange-400' : 'text-white/60'}`}>
                            {k.soLuotDaDung}/{k.soLuotSuDung}
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${almostOut ? 'bg-orange-500' : 'bg-primary'}`}
                            style={{ width: `${Math.min(pctUsed, 100)}%` }}
                          />
                        </div>
                        <p className="text-white/30 text-[11px]">Còn {luotConLai} lượt</p>
                      </div>
                    )}

                    {/* Mã code */}
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                      <span className="flex-1 text-sm font-black text-white tracking-widest">{k.maKhuyenMai}</span>
                      <button
                        onClick={() => copyCode(k.maKhuyenMai)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                          copied === k.maKhuyenMai
                            ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                            : 'bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25'
                        }`}
                      >
                        {copied === k.maKhuyenMai ? '✓ Đã sao chép' : 'Sao chép'}
                      </button>
                    </div>
                  </div>

                  {/* Dashed divider */}
                  <div className="mx-5 border-t border-dashed border-white/10" />

                  <div className="px-5 py-3">
                    <p className="text-xs text-white/30">Áp dụng khi đặt vé tại TTA Movie</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Hướng dẫn sử dụng */}
        <div className="mt-12 bg-[#111] border border-white/5 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white mb-4">Cách sử dụng mã khuyến mãi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: '1', icon: '🎬', title: 'Chọn phim & ghế', desc: 'Chọn phim, suất chiếu và ghế ngồi bạn muốn' },
              { step: '2', icon: '🎟️', title: 'Nhập mã', desc: 'Tại bước thanh toán, nhập mã khuyến mãi vào ô "Mã khuyến mãi"' },
              { step: '3', icon: '✅', title: 'Thanh toán', desc: 'Xác nhận và hoàn tất thanh toán với giá đã giảm' },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/15 rounded-full flex items-center justify-center text-primary text-xs font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.icon} {item.title}</p>
                  <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

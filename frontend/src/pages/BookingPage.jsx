import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import phimService from '../services/phimService'
import lichChieuService from '../services/lichChieuService'
import api from '../services/api'
import Loading from '../components/Loading'
import paymentService from '../services/paymentService'

const fmtMoney = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n)) + 'đ'
const fmtDateTime = (s) => {
  const d = new Date(s)
  return {
    date: d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }),
    time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }),
  }
}

const VIP_SURCHARGE = 20000
const COUNTDOWN_SECONDS = 8 * 60 // 8 phút

const FOODS = [
  { id: 'bp-l',   emoji: '🍿', name: 'Bắp rang bơ lớn',   desc: 'Size L · ~120g',      price: 55000, tag: null },
  { id: 'bp-m',   emoji: '🍿', name: 'Bắp rang bơ vừa',   desc: 'Size M · ~80g',       price: 40000, tag: null },
  { id: 'coca',   emoji: '🥤', name: 'Coca-Cola 32oz',     desc: 'Nước ngọt có ga',     price: 30000, tag: null },
  { id: 'sprite', emoji: '🥤', name: 'Sprite 32oz',        desc: 'Nước ngọt có ga',     price: 30000, tag: null },
  { id: 'nuoc',   emoji: '💧', name: 'Nước suối Aquafina', desc: '500ml',               price: 15000, tag: null },
  { id: 'cb1',    emoji: '🎉', name: 'Combo 1 người',      desc: 'Bắp M + 1 nước',     price: 60000, tag: 'Tiết kiệm 10k' },
  { id: 'cb2',    emoji: '🎉', name: 'Combo 2 người',      desc: 'Bắp L + 2 Coca',     price: 100000, tag: 'Tiết kiệm 15k' },
  { id: 'cb4',    emoji: '👨‍👩‍👧‍👦', name: 'Combo gia đình',    desc: '2 Bắp L + 4 nước',   price: 170000, tag: 'Tiết kiệm 30k' },
]

const PAYMENT_METHODS = [
  { id: 'vnpay',  label: 'VNPay',              icon: '🔵', desc: 'Cổng thanh toán VNPay' },
  { id: 'bank',   label: 'Chuyển khoản NH',    icon: '🏦', desc: 'Quét QR chuyển khoản ngân hàng' },
  { id: 'momo',   label: 'MoMo',               icon: '💜', desc: 'Ví điện tử MoMo' },
  { id: 'zalopay',label: 'ZaloPay',            icon: '🟦', desc: 'Ví ZaloPay' },
  { id: 'cash',   label: 'Tiền mặt',           icon: '💵', desc: 'Thanh toán tại quầy' },
]

function Steps({ step }) {
  const steps = ['Chọn ghế', 'Dịch vụ', 'Thanh toán']
  return (
    <div className="flex items-center">
      {steps.map((s, i) => {
        const idx = i + 1
        const active = step === idx
        const done = step > idx
        return (
          <div key={s} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold ${active ? 'text-white' : done ? 'text-white/40' : 'text-white/20'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                active ? 'bg-primary border-primary text-white' : done ? 'bg-white/15 border-white/15 text-white' : 'border-white/10 text-white/20'
              }`}>{done ? '✓' : idx}</span>
              <span className="hidden sm:inline">{s}</span>
            </div>
            {i < steps.length - 1 && <div className="w-4 h-px bg-white/10" />}
          </div>
        )
      })}
    </div>
  )
}

function Countdown({ seconds, onExpire }) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    if (left <= 0) { onExpire(); return }
    const t = setTimeout(() => setLeft(l => l - 1), 1000)
    return () => clearTimeout(t)
  }, [left, onExpire])
  const m = String(Math.floor(left / 60)).padStart(2, '0')
  const s = String(left % 60).padStart(2, '0')
  const urgent = left <= 60
  return (
    <div className={`flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-lg border ${
      urgent ? 'text-red-400 border-red-400/30 bg-red-400/10 animate-pulse' : 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5'
    }`}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {m}:{s}
    </div>
  )
}

export default function BookingPage() {
  const { lichChieuId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1) // 1: ghế, 2: food, 3: thanh toán
  const [lichChieu, setLichChieu] = useState(null)
  const [phim, setPhim] = useState(null)
  const [ghes, setGhes] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [cart, setCart] = useState({}) // { foodId: quantity }
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [bookedId, setBookedId] = useState(null)
  // Countdown khi vào step 3
  const [countdownActive, setCountdownActive] = useState(false)
  const [expired, setExpired] = useState(false)
  // Mã giảm giá
  const [maKM, setMaKM] = useState('')
  const [kmData, setKmData] = useState(null)
  const [kmLoading, setKmLoading] = useState(false)
  const [kmError, setKmError] = useState('')
  // Phương thức thanh toán
  const [payMethod, setPayMethod] = useState('vnpay')
  // Bank transfer modal
  const [bankModal, setBankModal] = useState(false)
  const [bankInfo, setBankInfo] = useState(null)
  const [confirming, setConfirming] = useState(false)

  const handleExpire = useCallback(() => setExpired(true), [])

  // Scroll to top khi đặt vé thành công
  useEffect(() => {
    if (done) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [done])

  useEffect(() => {
    if (!lichChieuId) return
    ;(async () => {
      try {
        setLoading(true)

        // Load lịch chiếu trước để lấy phimId
        const lcRes = await api.get(`/lichchieu/${lichChieuId}`)
        const lcData = lcRes.data
        setLichChieu(lcData)

        // Load phim và ghế song song, không để lỗi phim block ghế
        const [pmResult, grResult] = await Promise.allSettled([
          phimService.getById(lcData.phimId),
          lichChieuService.getGheByLichChieu(lichChieuId),
        ])

        if (pmResult.status === 'fulfilled') {
          setPhim(pmResult.value)
        } else {
          console.error('Load phim thất bại:', pmResult.reason)
        }

        if (grResult.status === 'fulfilled') {
          const gr = grResult.value
          // gr đã là res.data từ service, có thể là array hoặc wrapped object
          const gd = Array.isArray(gr) ? gr : (Array.isArray(gr?.data) ? gr.data : [])
          setGhes(gd)
        } else {
          console.error('Load ghế thất bại:', grResult.reason)
          setError('Không thể tải sơ đồ ghế. Vui lòng thử lại.')
        }
      } catch (e) {
        console.error(e)
        setError('Không thể tải thông tin suất chiếu.')
      } finally {
        setLoading(false)
      }
    })()
  }, [lichChieuId])

  const seatPrice = (ghe) => {
    const t = (ghe.loaiGhe || '').toLowerCase()
    return (lichChieu?.giaCoBan || 0) + (t === 'vip' ? VIP_SURCHARGE : 0)
  }

  // Kiểm tra xem việc chọn/bỏ ghế có tạo ra ghế trống lẻ ở giữa không
  const wouldLeaveGap = (newSelected, allGhes) => {
    // Group theo hàng
    const byRow = {}
    allGhes.forEach(g => {
      const row = (g.soGhe || g.tenGhe || '')[0]?.toUpperCase()
      if (!row) return
      if (!byRow[row]) byRow[row] = []
      byRow[row].push(g)
    })

    for (const seats of Object.values(byRow)) {
      const sorted = [...seats].sort((a, b) => {
        const na = parseInt((a.soGhe || a.tenGhe || '').slice(1)) || 0
        const nb = parseInt((b.soGhe || b.tenGhe || '').slice(1)) || 0
        return na - nb
      })

      for (let i = 1; i < sorted.length - 1; i++) {
        const prev = sorted[i - 1]
        const curr = sorted[i]
        const next = sorted[i + 1]

        const prevNum = parseInt((prev.soGhe || prev.tenGhe || '').slice(1)) || 0
        const currNum = parseInt((curr.soGhe || curr.tenGhe || '').slice(1)) || 0
        const nextNum = parseInt((next.soGhe || next.tenGhe || '').slice(1)) || 0

        // curr là ghế liền kề (số liên tiếp)
        if (currNum !== prevNum + 1 || currNum !== nextNum - 1) continue

        const prevSelected = newSelected.find(s => s.id === prev.id)
        const currSelected = newSelected.find(s => s.id === curr.id)
        const nextSelected = newSelected.find(s => s.id === next.id)
        const currTaken = curr.daDat

        // Chỉ báo lỗi khi curr trống (chưa bán, chưa chọn) kẹp giữa 2 ghế đang được CHỌN bởi user
        // Ghế đã bán không tính — user không thể chọn nó nên không phải lỗi của họ
        const currEmpty = !currSelected && !currTaken
        const prevOccupied = !!prevSelected  // chỉ tính ghế user đang chọn
        const nextOccupied = !!nextSelected  // chỉ tính ghế user đang chọn

        if (currEmpty && prevOccupied && nextOccupied) return true
      }
    }
    return false
  }

  const toggleSeat = (ghe) => {
    if (ghe.daDat) return
    const isSelected = !!selectedSeats.find(s => s.id === ghe.id)
    const newSelected = isSelected
      ? selectedSeats.filter(s => s.id !== ghe.id)
      : [...selectedSeats, ghe]

    if (wouldLeaveGap(newSelected, ghes)) {
      setError('Không được để trống 1 ghế ở giữa. Vui lòng chọn ghế liền kề.')
      return
    }
    setError('')
    setSelectedSeats(newSelected)
  }

  const changeQty = (id, delta) => {
    setCart(prev => {
      const q = Math.max(0, (prev[id] || 0) + delta)
      if (q === 0) { const n = { ...prev }; delete n[id]; return n }
      return { ...prev, [id]: q }
    })
  }

  // Kích hoạt countdown khi vào step 3
  const goToStep3 = () => {
    setStep(3)
    setCountdownActive(true)
    setExpired(false)
  }

  // Validate mã khuyến mãi
  const handleValidateKM = async () => {
    if (!maKM.trim()) return
    setKmLoading(true); setKmError(''); setKmData(null)
    try {
      const res = await api.get(`/khuyenmai/validate/${maKM.trim()}`)
      setKmData(res.data)
    } catch {
      setKmError('Mã không hợp lệ hoặc đã hết hạn')
    } finally {
      setKmLoading(false)
    }
  }

  const ticketTotal = selectedSeats.reduce((s, g) => s + seatPrice(g), 0)
  const foodTotal = Object.entries(cart).reduce((s, [id, q]) => {
    const f = FOODS.find(f => f.id === id)
    return s + (f ? f.price * q : 0)
  }, 0)
  const subtotal = ticketTotal + foodTotal
  const discount = kmData ? Math.round(subtotal * kmData.giaTriGiam / 100) : 0
  const grandTotal = subtotal - discount

  const handleBooking = async () => {
    if (!user) { navigate('/dang-nhap'); return }
    setBooking(true); setError('')
    try {
      const res = await api.post('/booking', {
        nguoiDungId: user.userId,
        lichChieuId: Number(lichChieuId),
        gheIds: selectedSeats.map(s => s.id),
      })

      const donDatVeId = res.data?.id || res.data?.data?.id

      // VNPay → redirect
      if (payMethod === 'vnpay' && donDatVeId) {
        const payRes = await paymentService.createVNPayUrl(donDatVeId)
        const paymentUrl = payRes.data?.paymentUrl
        if (paymentUrl) { window.location.href = paymentUrl; return }
      }

      // Chuyển khoản → hiện modal QR
      if (payMethod === 'bank' && donDatVeId) {
        const infoRes = await paymentService.getBankTransferInfo(donDatVeId)
        setBankInfo({ ...infoRes.data, donDatVeId })
        setBookedId(donDatVeId)
        setBankModal(true)
        return
      }

      setBookedId(donDatVeId)
      setDone(true)
    } catch (e) {
      setError(e.response?.data?.message || 'Đặt vé thất bại, vui lòng thử lại.')
    } finally {
      setBooking(false)
    }
  }

  const handleConfirmBankTransfer = async () => {
    if (!bankInfo?.donDatVeId) return
    setConfirming(true)
    try {
      await paymentService.confirmBankTransfer(bankInfo.donDatVeId)
      setBankModal(false)
      setDone(true)
    } catch {
      alert('Xác nhận thất bại, vui lòng thử lại.')
    } finally {
      setConfirming(false)
    }
  }

  if (loading) return <Loading fullScreen />

  if (done) {
    const maDon = bookedId ? `TTA${String(bookedId).padStart(6, '0')}` : 'TTA000000'
    const { date, time: timeStr } = lichChieu ? fmtDateTime(lichChieu.gioBatDau) : { date: '', time: '' }
    const seatsStr = selectedSeats.map(s => s.soGhe || s.tenGhe).join(', ')
    const qrData = `Mã đơn: ${maDon}\nPhim: ${phim?.tenPhim}\nRạp: ${lichChieu?.tenRap}\nPhòng: ${lichChieu?.tenPhong}\nSuất chiếu: ${timeStr} - ${date}\nGhế: ${seatsStr}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#0A0C10] flex flex-col items-center justify-start pt-16 px-4 pb-12">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-green-700/60 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-green-900/40">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-white">Đặt vé thành công!</h1>
            <p className="text-white/40 text-sm mt-1">Email xác nhận đã được gửi về hộp thư của bạn</p>
          </div>

          {/* Ticket card */}
          <div className="bg-[#15171E] border border-white/10 rounded-2xl overflow-hidden mb-5">
            {/* Ngày đặt */}
            <div className="px-5 pt-4 pb-2 border-b border-white/5">
              <p className="text-white/30 text-xs">Ngày đặt vé: {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
            </div>

            {/* QR + Info */}
            <div className="flex gap-4 p-5">
              {/* QR */}
              <div className="flex-shrink-0">
                <div className="bg-white p-2 rounded-xl">
                  <img src={qrUrl} alt={maDon} width={110} height={110} className="block" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                <p className="text-white font-black text-base uppercase leading-tight">{phim?.tenPhim}</p>
                <div className="space-y-0.5 text-sm text-white/50">
                  <p>Ngày chiếu: <span className="text-white/70">{date}</span></p>
                  <p>Giờ chiếu: <span className="text-white/70">{timeStr}</span></p>
                  <p>Rạp: <span className="text-white/70">{lichChieu?.tenRap}</span></p>
                  <p>Ghế: <span className="text-white/70">{selectedSeats.map(s => s.soGhe || s.tenGhe).join(', ')}</span></p>
                </div>
                <p className="text-red-500 font-bold text-xs mt-1">Xuất trình vé điện tử này để vào phòng chiếu</p>
              </div>
            </div>

            {/* Mã đơn */}
            <div className="px-5 py-3 bg-white/3 border-t border-white/5 flex items-center justify-between">
              <span className="text-white/30 text-xs uppercase tracking-wider">Mã đơn</span>
              <span className="text-red-500 font-black text-sm tracking-widest font-mono">{maDon}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Link
              to="/ve-cua-toi"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3 rounded-xl transition-colors text-center"
            >
              Xem vé của tôi
            </Link>
            <Link
              to="/phim"
              className="flex-1 border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-bold text-sm py-3 rounded-xl transition-colors text-center"
            >
              Về trang phim
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!lichChieu || !phim) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <p className="text-white/50 mb-4">{error || 'Không tìm thấy suất chiếu'}</p>
        <Link to="/phim" className="btn-primary px-6 py-2.5 text-sm">Quay lại</Link>
      </div>
    </div>
  )

  const { date, time } = fmtDateTime(lichChieu.gioBatDau)

  // Group ghế theo hàng
  const rows = ghes.reduce((acc, g) => {
    const row = (g.soGhe || g.tenGhe || '?')[0].toUpperCase()
    if (!acc[row]) acc[row] = []
    acc[row].push(g)
    return acc
  }, {})
  const sortedRows = Object.entries(rows).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      {/* Sticky header */}
      <div className="sticky top-16 z-20 bg-[#0a0a0a]/95 backdrop-blur border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : navigate(`/phim/${phim.id}`)}
            className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {step > 1 ? 'Quay lại' : 'Thoát'}
          </button>
          <Steps step={step} />
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ===== MAIN CONTENT ===== */}
          <div className="lg:col-span-2 space-y-6">

            {/* Thông tin suất chiếu */}
            <div className="flex items-center gap-4 bg-[#111] border border-white/5 rounded-xl p-4">
              <img src={phim.posterUrl} alt={phim.tenPhim}
                className="w-12 h-18 object-cover rounded-lg shrink-0"
                onError={e => e.target.style.display = 'none'} />
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-white truncate">{phim.tenPhim}</h2>
                <p className="text-xs text-white/40 mt-0.5">{lichChieu.tenRap} · {lichChieu.tenPhong}</p>
                <p className="text-xs text-primary font-semibold mt-1">{time} · {date}</p>
              </div>
            </div>

            {/* ---- STEP 1: Chọn ghế ---- */}
            {step === 1 && (
              <div className="space-y-5">
                {/* Màn hình */}
                <div className="text-center pt-2">
                  <div className="mx-auto w-2/3 h-1.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full mb-1.5" />
                  <p className="text-[10px] text-white/25 uppercase tracking-widest">Màn hình</p>
                </div>

                {/* Sơ đồ */}
                <div className="overflow-x-auto py-2">
                  {ghes.length === 0 ? (
                    <p className="text-center text-white/30 text-sm py-10">Không có dữ liệu ghế</p>
                  ) : (
                    <div className="space-y-2 w-fit mx-auto">
                      {sortedRows.map(([row, seats]) => {
                        const sorted = [...seats].sort((a, b) => {
                          const na = parseInt((a.soGhe || a.tenGhe || '').slice(1)) || 0
                          const nb = parseInt((b.soGhe || b.tenGhe || '').slice(1)) || 0
                          return na - nb
                        })
                        return (
                          <div key={row} className="flex items-center gap-2">
                            <span className="w-5 text-center text-xs text-white/25 font-medium shrink-0">{row}</span>
                            <div className="flex gap-1.5">
                              {sorted.map(ghe => {
                                const label = (ghe.soGhe || ghe.tenGhe || '?').slice(1)
                                const isSelected = !!selectedSeats.find(s => s.id === ghe.id)
                                const isTaken = ghe.daDat
                                const type = (ghe.loaiGhe || '').toLowerCase()
                                const price = seatPrice(ghe)

                                let cls = ''
                                if (isTaken) cls = 'bg-white/4 border-white/5 text-white/10 cursor-not-allowed'
                                else if (isSelected) cls = 'bg-primary border-primary text-white scale-105 shadow-lg shadow-primary/30'
                                else if (type === 'vip') cls = 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/20 hover:border-yellow-400 cursor-pointer'
                                else if (type === 'doi' || type === 'đôi') cls = 'bg-pink-500/10 border-pink-500/40 text-pink-400 hover:bg-pink-500/20 hover:border-pink-400 cursor-pointer'
                                else cls = 'bg-white/5 border-white/15 text-white/60 hover:bg-white/10 hover:border-white/40 cursor-pointer'

                                return (
                                  <button key={ghe.id} onClick={() => toggleSeat(ghe)} disabled={isTaken}
                                    title={`${ghe.soGhe || ghe.tenGhe} · ${ghe.loaiGhe || 'Thường'} · ${fmtMoney(price)}`}
                                    className={`w-8 h-8 text-[11px] font-semibold rounded border transition-all duration-150 ${cls}`}>
                                    {label}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Chú thích */}
                <div className="flex flex-wrap justify-center gap-4 text-xs text-white/40 pt-2">
                  {[
                    { cls: 'bg-white/5 border-white/15', label: `Thường · ${fmtMoney(lichChieu.giaCoBan)}` },
                    { cls: 'bg-yellow-500/10 border-yellow-500/40', label: `VIP · ${fmtMoney(lichChieu.giaCoBan + VIP_SURCHARGE)}` },
                    { cls: 'bg-pink-500/10 border-pink-500/40', label: 'Đôi' },
                    { cls: 'bg-primary border-primary', label: 'Đang chọn' },
                    { cls: 'bg-white/4 border-white/5 opacity-40', label: 'Đã bán' },
                  ].map(({ cls, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div className={`w-3.5 h-3.5 rounded border ${cls}`} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Lỗi ghế */}
                {error && (
                  <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 text-center">
                    {error}
                  </p>
                )}
              </div>
            )}

            {/* ---- STEP 2: Dịch vụ đi kèm ---- */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-white mb-1">Dịch vụ đi kèm</h2>
                  <p className="text-xs text-white/40">Thêm bắp rang, nước uống để trải nghiệm tốt hơn</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FOODS.map(food => {
                    const qty = cart[food.id] || 0
                    return (
                      <div key={food.id}
                        className={`bg-[#111] border rounded-xl p-4 flex items-center gap-3 transition-all ${
                          qty > 0 ? 'border-primary/40 bg-primary/5' : 'border-white/5 hover:border-white/10'
                        }`}>
                        <span className="text-2xl shrink-0">{food.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-white">{food.name}</p>
                            {food.tag && (
                              <span className="text-[10px] bg-green-500/15 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded-full font-semibold">
                                {food.tag}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/40 mt-0.5">{food.desc}</p>
                          <p className="text-sm font-bold text-primary mt-1">{fmtMoney(food.price)}</p>
                        </div>
                        {/* Qty control */}
                        <div className="flex items-center gap-2 shrink-0">
                          {qty > 0 ? (
                            <>
                              <button onClick={() => changeQty(food.id, -1)}
                                className="w-7 h-7 rounded-full border border-white/20 text-white/60 hover:border-white/50 hover:text-white flex items-center justify-center text-lg leading-none transition-colors">
                                −
                              </button>
                              <span className="w-5 text-center text-sm font-bold text-white">{qty}</span>
                              <button onClick={() => changeQty(food.id, 1)}
                                className="w-7 h-7 rounded-full bg-primary/80 hover:bg-primary text-white flex items-center justify-center text-lg leading-none transition-colors">
                                +
                              </button>
                            </>
                          ) : (
                            <button onClick={() => changeQty(food.id, 1)}
                              className="w-7 h-7 rounded-full border border-white/20 text-white/40 hover:border-primary hover:text-primary flex items-center justify-center text-lg leading-none transition-colors">
                              +
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <button onClick={() => goToStep3()}
                  className="w-full text-xs text-white/30 hover:text-white/60 py-2 transition-colors">
                  Bỏ qua, không cần dịch vụ →
                </button>
              </div>
            )}

            {/* ---- STEP 3: Thanh toán ---- */}
            {step === 3 && (
              <div className="space-y-5">
                {/* Expired overlay */}
                {expired && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-bold text-red-400">Phiên đặt vé đã hết hạn</p>
                      <p className="text-xs text-red-400/70 mt-0.5">Ghế có thể đã được người khác đặt. Vui lòng chọn lại.</p>
                    </div>
                    <button onClick={() => { setStep(1); setExpired(false); setSelectedSeats([]) }}
                      className="ml-auto text-xs text-red-400 border border-red-400/30 px-3 py-1.5 rounded-lg hover:bg-red-400/10 transition-colors shrink-0">
                      Chọn lại
                    </button>
                  </div>
                )}

                {/* Tóm tắt đơn */}
                <div className="bg-[#111] border border-white/5 rounded-xl divide-y divide-white/5">
                  <div className="px-5 py-4">
                    <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Ghế đã chọn</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSeats.map(s => {
                        const type = (s.loaiGhe || '').toLowerCase()
                        return (
                          <span key={s.id} className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                            type === 'vip' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                            : type === 'doi' || type === 'đôi' ? 'bg-pink-500/10 border-pink-500/30 text-pink-400'
                            : 'bg-white/5 border-white/15 text-white/70'
                          }`}>
                            {s.soGhe || s.tenGhe}{type === 'vip' && ' VIP'}
                          </span>
                        )
                      })}
                    </div>
                  </div>

                  {Object.keys(cart).length > 0 && (
                    <div className="px-5 py-4">
                      <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Dịch vụ đi kèm</p>
                      <div className="space-y-1">
                        {Object.entries(cart).map(([id, qty]) => {
                          const f = FOODS.find(f => f.id === id)
                          return f ? (
                            <div key={id} className="flex justify-between text-sm">
                              <span className="text-white/70">{f.emoji} {f.name} × {qty}</span>
                              <span className="text-white/50">{fmtMoney(f.price * qty)}</span>
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}

                  <div className="px-5 py-4 space-y-2">
                    <div className="flex justify-between text-sm text-white/50">
                      <span>Vé ({selectedSeats.length} ghế)</span><span>{fmtMoney(ticketTotal)}</span>
                    </div>
                    {foodTotal > 0 && (
                      <div className="flex justify-between text-sm text-white/50">
                        <span>Dịch vụ</span><span>{fmtMoney(foodTotal)}</span>
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-400">
                        <span>Giảm giá ({kmData.giaTriGiam}%)</span><span>-{fmtMoney(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/5">
                      <span>Tổng cộng</span>
                      <span className="text-primary text-base">{fmtMoney(grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Mã giảm giá */}
                <div className="bg-[#111] border border-white/5 rounded-xl p-5 space-y-3">
                  <p className="text-xs font-bold text-white/60 uppercase tracking-wider">Mã khuyến mãi</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={maKM}
                      onChange={e => { setMaKM(e.target.value.toUpperCase()); setKmError(''); setKmData(null) }}
                      onKeyDown={e => e.key === 'Enter' && handleValidateKM()}
                      placeholder="Nhập mã khuyến mãi..."
                      className="input-field text-sm flex-1 uppercase tracking-widest"
                    />
                    <button onClick={handleValidateKM} disabled={kmLoading || !maKM.trim()}
                      className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-xl border border-white/10 transition-colors disabled:opacity-40 shrink-0">
                      {kmLoading ? '...' : 'Áp dụng'}
                    </button>
                  </div>
                  {kmError && <p className="text-xs text-red-400">{kmError}</p>}
                  {kmData && (
                    <div className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Áp dụng <strong>{kmData.maKhuyenMai}</strong> — giảm {kmData.giaTriGiam}% ({fmtMoney(discount)})</span>
                      <button onClick={() => { setKmData(null); setMaKM('') }} className="ml-auto text-green-400/60 hover:text-green-400">✕</button>
                    </div>
                  )}
                </div>

                {/* Phương thức thanh toán */}
                <div className="bg-[#111] border border-white/5 rounded-xl p-5 space-y-3">
                  <p className="text-xs font-bold text-white/60 uppercase tracking-wider">Phương thức thanh toán</p>
                  <div className="space-y-2">
                    {PAYMENT_METHODS.map(pm => (
                      <button key={pm.id} onClick={() => setPayMethod(pm.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                          payMethod === pm.id
                            ? 'border-primary/50 bg-primary/8'
                            : 'border-white/5 hover:border-white/15 bg-white/2'
                        }`}>
                        <span className="text-xl shrink-0">{pm.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{pm.label}</p>
                          <p className="text-xs text-white/40">{pm.desc}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                          payMethod === pm.id ? 'border-primary bg-primary' : 'border-white/20'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>
                )}
                <p className="text-[11px] text-white/20 text-center">Vé đã mua không được hoàn trả</p>
              </div>
            )}
          </div>

          {/* ===== SIDEBAR ===== */}
          <div className="lg:col-span-1">
            <div className="bg-[#111] border border-white/5 rounded-xl p-5 sticky top-32 space-y-4">
              {/* Countdown — chỉ hiện ở step 3 */}
              {countdownActive && step === 3 && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/40">Thời gian giữ ghế</p>
                  <Countdown seconds={COUNTDOWN_SECONDS} onExpire={handleExpire} />
                </div>
              )}

              <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">Tóm tắt</h3>

              {/* Ghế */}
              <div>
                <p className="text-xs text-white/30 mb-2">Ghế đã chọn</p>
                {selectedSeats.length === 0 ? (
                  <p className="text-xs text-white/20 italic">Chưa chọn ghế</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {selectedSeats.map(s => (
                      <span key={s.id} className="text-[11px] bg-primary/15 text-primary border border-primary/25 px-2 py-0.5 rounded-full font-semibold">
                        {s.soGhe || s.tenGhe}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Food */}
              {Object.keys(cart).length > 0 && (
                <div className="pt-3 border-t border-white/5">
                  <p className="text-xs text-white/30 mb-2">Dịch vụ</p>
                  <div className="space-y-1">
                    {Object.entries(cart).map(([id, qty]) => {
                      const f = FOODS.find(f => f.id === id)
                      return f ? (
                        <div key={id} className="flex justify-between text-xs text-white/50">
                          <span>{f.emoji} {f.name} ×{qty}</span>
                          <span>{fmtMoney(f.price * qty)}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              {/* Tổng */}
              <div className="pt-3 border-t border-white/5 space-y-1.5">
                {ticketTotal > 0 && (
                  <div className="flex justify-between text-xs text-white/40">
                    <span>Vé</span><span>{fmtMoney(ticketTotal)}</span>
                  </div>
                )}
                {foodTotal > 0 && (
                  <div className="flex justify-between text-xs text-white/40">
                    <span>Dịch vụ</span><span>{fmtMoney(foodTotal)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-xs text-green-400">
                    <span>Giảm giá</span><span>-{fmtMoney(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-white/5">
                  <span>Tổng</span>
                  <span className="text-primary">{fmtMoney(grandTotal)}</span>
                </div>
              </div>

              {/* CTA */}
              {step === 1 && (
                <button onClick={() => { if (selectedSeats.length > 0) setStep(2) }}
                  disabled={selectedSeats.length === 0}
                  className="w-full btn-primary py-2.5 text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed">
                  Tiếp tục →
                </button>
              )}
              {step === 2 && (
                <button onClick={goToStep3}
                  className="w-full btn-primary py-2.5 text-sm font-bold">
                  Thanh toán →
                </button>
              )}
              {step === 3 && (
                <>
                  {error && (
                    <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
                  )}
                  <button onClick={handleBooking} disabled={booking || expired}
                    className="w-full btn-primary py-3 font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {booking
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang xử lý...</>
                      : <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                          </svg>
                          Thanh toán {fmtMoney(grandTotal)}
                        </>
                    }
                  </button>
                  <p className="text-[10px] text-white/20 text-center -mt-1">Vé đã mua không được hoàn trả</p>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ===== BANK TRANSFER MODAL ===== */}
      {bankModal && bankInfo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#15171E] border border-white/10 rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-base font-bold text-white">Chuyển khoản ngân hàng</h2>
              <button onClick={() => setBankModal(false)} className="text-white/40 hover:text-white transition-colors text-xl leading-none">✕</button>
            </div>

            <div className="p-5 flex flex-col items-center gap-4">
              {/* QR VietQR */}
              <div className="bg-white p-2 rounded-xl">
                <img src={bankInfo.qrUrl} alt="QR chuyển khoản" width={220} height={220} className="rounded-lg block" />
              </div>

              {/* Thông tin TK */}
              <div className="w-full bg-[#1f2128] rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/40">Ngân hàng</span>
                  <span className="text-white font-semibold">{bankInfo.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Số tài khoản</span>
                  <span className="text-white font-mono font-bold">{bankInfo.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Chủ tài khoản</span>
                  <span className="text-white font-semibold text-right max-w-[55%]">{bankInfo.accountName}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2">
                  <span className="text-white/40">Số tiền</span>
                  <span className="text-red-500 font-black text-base">{new Intl.NumberFormat('vi-VN').format(bankInfo.amount)}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Nội dung CK</span>
                  <span className="text-yellow-400 font-bold font-mono">{bankInfo.description}</span>
                </div>
              </div>

              <p className="text-white/30 text-xs text-center">Quét mã QR hoặc chuyển khoản theo thông tin trên, sau đó nhấn xác nhận.</p>

              <button
                onClick={handleConfirmBankTransfer}
                disabled={confirming}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {confirming
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang xác nhận...</>
                  : 'Tôi đã chuyển khoản xong'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import bookingService from '../services/bookingService'

export default function PaymentResult() {
  const [params] = useSearchParams()
  const status  = params.get('status')   // 'success' | 'failed'
  const orderId = params.get('orderId')
  const message = params.get('message')
  const lichChieuId = params.get('lichChieuId')

  const isSuccess = status === 'success'

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(isSuccess && !!orderId)

  useEffect(() => {
    if (isSuccess && orderId) {
      bookingService.getById(orderId)
        .then(data => {
          setBooking(data.data || data)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [isSuccess, orderId])

  if (loading) {
     return <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center text-white"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"/></div>
  }

  // format date time
  const fmtDateTime = (s) => {
    if (!s) return { date: '', time: '' }
    const d = new Date(s)
    return {
      date: d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }),
    }
  }

  if (isSuccess && booking) {
    const maDon = `TTA${String(booking.id || orderId).padStart(6, '0')}`
    const { date, time: timeStr } = fmtDateTime(booking.gioBatDau)
    const seatsStr = Array.isArray(booking.danhSachGhe) ? booking.danhSachGhe.join(', ') : ''
    
    // Nhanh chong QR Data
    const qrData = `Mã đơn: ${maDon}\nPhim: ${booking.tenPhim}\nRạp: ${booking.tenRap}\nPhòng: ${booking.tenPhong}\nSuất chiếu: ${timeStr} - ${date}\nGhế: ${seatsStr}`
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
            <div className="px-5 pt-4 pb-2 border-b border-white/5">
              <p className="text-white/30 text-xs">Ngày đặt vé: {new Date(booking.ngayTao || Date.now()).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
            </div>

            <div className="flex gap-4 p-5">
              <div className="flex-shrink-0">
                <div className="bg-white p-2 rounded-xl">
                  <img src={qrUrl} alt={maDon} width={110} height={110} className="block" />
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                <p className="text-white font-black text-base uppercase leading-tight">{booking.tenPhim}</p>
                <div className="space-y-0.5 text-sm text-white/50">
                  <p>Ngày chiếu: <span className="text-white/70">{date}</span></p>
                  <p>Giờ chiếu: <span className="text-white/70">{timeStr}</span></p>
                  <p>Rạp: <span className="text-white/70">{booking.tenRap}</span></p>
                  <p>Ghế: <span className="text-white/70">{seatsStr}</span></p>
                </div>
                <p className="text-red-500 font-bold text-xs mt-1">Xuất trình vé điện tử này để vào phòng chiếu</p>
              </div>
            </div>

            <div className="px-5 py-3 bg-white/3 border-t border-white/5 flex items-center justify-between">
              <span className="text-white/30 text-xs uppercase tracking-wider">Mã đơn</span>
              <span className="text-red-500 font-black text-sm tracking-widest font-mono">{maDon}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Link to="/ve-cua-toi" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3 rounded-xl transition-colors text-center">
              Xem vé của tôi
            </Link>
            <Link to="/phim" className="flex-1 border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-bold text-sm py-3 rounded-xl transition-colors text-center">
              Về trang phim
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Fallback / failed screen:
  return (
    <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center px-4">
      <div className="bg-[#15171E] border border-white/10 rounded-2xl p-10 max-w-md w-full text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isSuccess ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
          {isSuccess ? (
            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <h1 className={`text-2xl font-black mb-2 ${isSuccess ? 'text-white' : 'text-red-400'}`}>
          {isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          {isSuccess
            ? 'Đơn đặt vé của bạn đã được xác nhận.'
            : (message ? decodeURIComponent(message) : 'Giao dịch không thành công. Vui lòng thử lại.')}
        </p>

        <div className="flex flex-col gap-3">
          {isSuccess && (
            <Link to="/ve-cua-toi" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors">
              Xem vé của tôi
            </Link>
          )}
          {!isSuccess && lichChieuId && (
            <Link to={`/dat-ve/${lichChieuId}`} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors">
              Thử lại
            </Link>
          )}
          <Link to="/phim" className="w-full border border-white/10 hover:border-white/30 text-gray-400 hover:text-white font-bold py-3 rounded-xl transition-colors">
            Về trang phim
          </Link>
        </div>
      </div>
    </div>
  )
}

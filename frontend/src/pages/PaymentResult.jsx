import { useSearchParams, Link } from 'react-router-dom'

export default function PaymentResult() {
  const [params] = useSearchParams()
  const status  = params.get('status')   // 'success' | 'failed'
  const orderId = params.get('orderId')
  const message = params.get('message')

  const isSuccess = status === 'success'

  return (
    <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center px-4">
      <div className="bg-[#15171E] border border-white/10 rounded-2xl p-10 max-w-md w-full text-center">

        {/* Icon */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
          isSuccess ? 'bg-green-500/15' : 'bg-red-500/15'
        }`}>
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

        <p className="text-gray-400 text-sm mb-1">
          {isSuccess
            ? 'Đơn đặt vé của bạn đã được xác nhận.'
            : (message ? decodeURIComponent(message) : 'Giao dịch không thành công. Vui lòng thử lại.')}
        </p>

        {orderId && (
          <p className="text-white/30 text-xs mt-1 mb-6">Mã đơn: #{orderId}</p>
        )}

        {/* QR Code */}
        {isSuccess && orderId && (
          <div className="bg-[#1f2128] rounded-xl p-5 mb-6 flex flex-col items-center gap-3">
            <p className="text-white/40 text-xs uppercase tracking-wider">Xuất trình tại quầy</p>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('TTA' + String(orderId).padStart(6, '0'))}`}
              alt="QR vé"
              className="rounded-lg bg-white p-2"
              width={180}
              height={180}
            />
            <p className="text-red-500 font-bold text-sm tracking-widest">
              TTA{String(orderId).padStart(6, '0')}
            </p>
            <p className="text-white/30 text-xs text-center">Email xác nhận đã được gửi về hộp thư của bạn</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {isSuccess && (
            <Link
              to="/ve-cua-toi"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Xem vé của tôi
            </Link>
          )}
          {!isSuccess && orderId && (
            <Link
              to={`/dat-ve/${params.get('lichChieuId') || ''}`}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Thử lại
            </Link>
          )}
          <Link
            to="/phim"
            className="w-full border border-white/10 hover:border-white/30 text-gray-400 hover:text-white font-bold py-3 rounded-xl transition-colors"
          >
            Về trang phim
          </Link>
        </div>
      </div>
    </div>
  )
}

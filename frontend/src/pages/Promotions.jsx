import { Link } from 'react-router-dom'

const promotions = [
  {
    id: 1,
    title: 'Giảm 30% cho thành viên TTA Club',
    desc: 'Tất cả các ngày trong tuần, áp dụng cho tất cả các bộ phim',
    discount: '30%',
    image: 'https://images.unsplash.com/photo-1489599849228-ed6fcf92290f?w=800',
    validUntil: '31/12/2025',
    code: 'TTACLUB30'
  },
  {
    id: 2,
    title: 'Đặt 3 vé tặng 1 combo nước ngọt',
    desc: 'Mua 3 vé xem phim, tặng ngay 1 combo bắp nước',
    discount: 'TẶNG',
    image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800',
    validUntil: '30/11/2025',
    code: 'BUY3GET1'
  },
  {
    id: 3,
    title: 'Suất chiều chỉ từ 49.000đ',
    desc: 'Mỗi chiều từ 1h - 5h chiều, giá vé chỉ từ 49.000đ',
    discount: '-50%',
    image: 'https://images.unsplash.com/photo-1489599849228-ed6fcf92290f?w=800',
    validUntil: '30/12/2025',
    code: 'AFTERNOON'
  },
  {
    id: 4,
    title: 'Miễn phí vé cho trẻ em dưới 5 tuổi',
    desc: 'Trẻ em dưới 5 tuổi được miễn phí vé khi có người lớn đi kèm',
    discount: 'FREE',
    image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800',
    validUntil: '31/12/2025',
    code: 'KIDS'
  },
  {
    id: 5,
    title: 'Hoàn tiền 20% cho khách hàng loyalty',
    desc: 'Mỗi lần mua vé sẽ được tích lũy điểm, 100 điểm = 100.000đ',
    discount: 'HOÀN 20%',
    image: 'https://images.unsplash.com/photo-1489599849228-ed6fcf92290f?w=800',
    validUntil: '31/12/2025',
    code: 'LOYALTY'
  },
  {
    id: 6,
    title: 'Giảm 15% cho nhân viên văn phòng',
    desc: 'Đặc biệt cho các bạn nhân viên, giảm 15% tất cả vé',
    discount: '-15%',
    image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800',
    validUntil: '31/12/2025',
    code: 'OFFICE15'
  },
]

export default function Promotions() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-dark-card border-b border-dark-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-white/40 mb-3">
            <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">Khuyến mãi</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Khuyến mãi hấp dẫn</h1>
          <p className="text-white/60">Khám phá những ưu đãi độc quyền tại TTA Movie</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Highlight Section */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-12">
              <div className="flex flex-col justify-center">
                <h2 className="text-4xl font-black text-white mb-4">Trở thành thành viên TTA Club</h2>
                <p className="text-white/80 text-lg mb-6 leading-relaxed">
                  Tham gia ngay để nhận ưu đãi đặc biệt, giảm giá lên đến 30%, cứ 10 vé được 1 vé miễn phí!
                </p>
                <div className="flex items-center gap-3">
                  <Link to="/register" className="btn-white inline-flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Tham gia ngay
                  </Link>
                  <p className="text-white/60">Hoàn toàn miễn phí</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl font-black text-white/20 mb-4">♥</div>
                  <p className="text-white/80">Hơn 50,000 thành viên tin tưởng</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Promotions Grid */}
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1 h-6 bg-primary rounded-full" />
            <h2 className="text-2xl font-bold text-white">Những ưu đãi hiện tại</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map(promo => (
              <div key={promo.id} className="bg-dark-card border border-dark-border rounded-lg overflow-hidden hover:border-primary/50 transition-all group">
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={promo.image}
                    alt={promo.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => { e.target.style.background = '#0a0e27' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent" />
                  <div className="absolute top-3 right-3 bg-primary text-white text-sm font-bold px-3 py-1.5 rounded-full">
                    {promo.discount}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{promo.title}</h3>
                  <p className="text-sm text-white/60 mb-4 line-clamp-2">{promo.desc}</p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40">Mã khuyến mãi:</span>
                      <code className="bg-white/5 text-primary px-2 py-1 rounded font-mono text-xs font-bold">
                        {promo.code}
                      </code>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40">Hết hạn:</span>
                      <span className="text-white">{promo.validUntil}</span>
                    </div>
                  </div>

                  <button className="w-full mt-4 btn-primary text-sm font-semibold">
                    Chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1 h-6 bg-primary rounded-full" />
            <h2 className="text-2xl font-bold text-white">Câu hỏi thường gặp</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { q: 'Làm sao để sử dụng mã khuyến mãi?', a: 'Nhập mã khuyến mãi khi đặt vé. Mã sẽ được áp dụng tự động nếu hợp lệ.' },
              { q: 'Mã khuyến mãi có thể kết hợp nhau không?', a: 'Không, chỉ có thể sử dụng 1 mã khuyến mãi cho 1 đơn hàng.' },
              { q: 'Điểm TTA Club hết hạn khi nào?', a: 'Điểm của bạn không bao giờ hết hạn nếu tài khoản vẫn đang hoạt động.' },
              { q: 'Làm sao nhận được hoàn tiền?', a: 'Hoàn tiền sẽ được cộng vào tài khoản TTA Club của bạn sau 24h.' },
            ].map((item, i) => (
              <div key={i} className="bg-dark-card border border-dark-border rounded-lg p-5">
                <h4 className="font-bold text-white mb-2 flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
                  </svg>
                  {item.q}
                </h4>
                <p className="text-white/60 text-sm ml-8">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

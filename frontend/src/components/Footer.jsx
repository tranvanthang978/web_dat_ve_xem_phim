import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-dark-card border-t border-dark-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-black">
                <span className="text-primary">TTA</span>
                <span className="text-white">Movie</span>
              </span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed">
              Trải nghiệm điện ảnh đỉnh cao với hệ thống rạp chiếu phim hiện đại trên toàn quốc.
            </p>
          </div>

          {/* Khám phá */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Khám phá</h4>
            <ul className="space-y-2">
              {[['Phim đang chiếu', '/phim'], ['Phim sắp chiếu', '/phim?tab=sap-chieu'], ['Rạp chiếu', '/rap'], ['Khuyến mãi', '/khuyen-mai']].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-white/40 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Hỗ trợ</h4>
            <ul className="space-y-2">
              {[['Liên hệ', '/lien-he'], ['FAQ', '/faq'], ['Hướng dẫn đặt vé', '/huong-dan'], ['Chính sách hoàn vé', '/chinh-sach']].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-white/40 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tài khoản */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Tài khoản</h4>
            <ul className="space-y-2">
              {[['Đăng nhập', '/login'], ['Đăng ký', '/register'], ['Vé của tôi', '/ve-cua-toi']].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-white/40 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">© 2026 TTA Movie. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-4">
            <Link to="/chinh-sach-bao-mat" className="text-xs text-white/30 hover:text-white/60 transition-colors">Chính sách bảo mật</Link>
            <Link to="/dieu-khoan" className="text-xs text-white/30 hover:text-white/60 transition-colors">Điều khoản</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

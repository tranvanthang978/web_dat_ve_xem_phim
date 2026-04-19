export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 text-white min-h-[70vh]">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <span className="w-8 h-1 bg-primary rounded-full block"></span>
        Liên Hệ Chúng Tôi
      </h1>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <p className="text-white/70 leading-relaxed text-sm">
            Nếu bạn có bất kỳ câu hỏi nào về dịch vụ đặt vé, rạp chiếu phim hoặc tài khoản của bạn, xin đừng ngần ngại liên hệ với bộ phận CSKH của TTA Movie.
          </p>
          
          <div className="bg-dark-card p-6 rounded-2xl border border-white/5 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11l-3-3m0 0l-3 3m3-3v8" /></svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90 mb-1">Địa chỉ</h3>
                <p className="text-sm text-white/50">Tầng 7, Tòa nhà TTA Tower, Quận Cầu Giấy, Hà Nội</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90 mb-1">Hotline</h3>
                <p className="text-sm text-white/50">1900 6868 (8:00 - 22:00 hàng ngày)</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90 mb-1">Email Hỗ trợ</h3>
                <p className="text-sm text-white/50">support@ttamovie.vn</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <form className="bg-dark-card p-6 md:p-8 rounded-2xl border border-white/5 space-y-4">
            <h2 className="text-lg font-bold mb-4">Gửi tin nhắn cho chúng tôi</h2>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Họ Tên</label>
              <input type="text" className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-primary focus:outline-none transition-colors" placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Email</label>
              <input type="email" className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-primary focus:outline-none transition-colors" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Tin nhắn</label>
              <textarea rows="4" className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-primary focus:outline-none transition-colors resize-none" placeholder="Nhập nội dung cần hỗ trợ..."></textarea>
            </div>
            <button type="button" className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-4" onClick={(e) => { e.preventDefault(); alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.')}}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              Gửi Tin Nhắn
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

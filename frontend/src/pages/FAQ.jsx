export default function FAQ() {
  const faqs = [
    {
      q: "Làm sao để đặt vé xem phim trực tuyến?",
      a: "Chỉ cần đăng nhập vào hệ thống, chọn Phim hoặc Lịch chiếu, chọn ghế ngồi yêu thích và tiến hành thanh toán qua cổng VNPay. Vé điện tử (Mã QR) sẽ được gửi thẳng vào email của bạn ngay sau khi thanh toán thành công."
    },
    {
      q: "Tôi có thể thanh toán bằng những hình thức nào?",
      a: "TTA Movie hiện tại chỉ hỗ trợ thanh toán qua cổng VNPay (sử dụng Ví VNPay, thẻ ATM nội địa, hoặc thẻ tín dụng/ghi nợ quốc tế)."
    },
    {
      q: "Tôi không nhận được email xác nhận hay mã vé QR sau khi đặt?",
      a: "Bạn vui lòng kiểm tra hộp thư rác (Spam/Junk). Nếu vẫn không nhận được trong vòng 10 phút, bạn có thể vào phần 'Vé của tôi' trên website để lấy trực tiếp mã vé hoặc liên hệ Hotline."
    },
    {
      q: "Làm thế nào để áp dụng mã khuyến mãi?",
      a: "Tại trang Tóm tắt Đơn đặt vé (trước khi thanh toán), bạn sẽ thấy ô nhập Mã khuyến mãi. Nhập mã và bấm Áp dụng, hệ thống sẽ tự động trừ đi số phần trăm hoặc số tiền tương ứng tùy theo ưu đãi."
    },
    {
      q: "Vé trẻ em được áp dụng cho độ tuổi nào?",
      a: "Hệ thống tự động phân loại phim theo độ tuổi (Ví dụ T18, T13). Đối với các xuất chiếu được phép có trẻ em, vé trẻ em thường được áp dụng cho khán giả dưới 12 tuổi và cao dưới 1.3m."
    }
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-white min-h-[70vh]">
      <h1 className="text-3xl font-bold mb-2 text-center text-white">Câu Hỏi Thường Gặp (FAQ)</h1>
      <p className="text-white/40 text-sm text-center mb-12">Tìm đáp án nhanh cho những thắc mắc của bạn</p>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-dark-card border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
            <h3 className="text-base font-bold text-white mb-2 flex gap-3">
              <span className="text-primary font-black shrink-0">Q.</span>
              {faq.q}
            </h3>
            <p className="text-sm text-white/50 leading-relaxed pl-7">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-sm text-white/40 mb-4">Vẫn còn thắc mắc?</p>
        <a href="/lien-he" className="btn-outline px-6 py-2 text-sm inline-block">Liên hệ hỗ trợ</a>
      </div>
    </div>
  )
}

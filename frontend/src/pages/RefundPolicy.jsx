export default function RefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-white min-h-[70vh]">
      <div className="bg-dark-card border border-white/5 rounded-3xl p-8 md:p-12">
        <h1 className="text-3xl font-bold mb-8 text-center border-b border-white/10 pb-6 uppercase tracking-wider text-primary">Chính Sách Hoàn/Hủy Vé</h1>
        
        <div className="prose prose-invert max-w-none text-white/70 space-y-6 text-sm">
          <p className="leading-relaxed">
            Nhằm đảm bảo quyền lợi và trải nghiệm tốt nhất cho tất cả Khách hàng khi giao dịch tại hệ thống TTA Movie, chúng tôi xin cung cấp quy định chung về chính sách hoàn/hủy vé như sau:
          </p>

          <h2 className="text-lg font-bold text-white mt-10 mb-4">1. Quy định chung</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Trừ một số trường hợp rạp gặp sự cố kỹ thuật hoặc lỗi hệ thống bất khả kháng, TTA Movie <strong>không hỗ trợ hủy, đổi, hoặc hoàn tiền vé</strong> sau khi bạn đã hoàn tất quá trình thanh toán thành công và nhận được vé hệ thống.</li>
            <li>Vé chỉ có giá trị cho xuất chiếu, rạp chiếu, phòng chiếu, ngày và giờ chiếu chính xác đã in trên vé hoặc gửi kèm trong email/sms.</li>
            <li>Vé không có giá trị quy đổi thành tiền mặt hoặc các sản phẩm khác tương đương.</li>
          </ul>

          <h2 className="text-lg font-bold text-white mt-10 mb-4">2. Quy định dành riêng cho trường hợp gặp lỗi</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Tài khoản đã bị trừ tiền nhưng chưa nhận được mã vé:</strong> Trong một số trường hợp giao dịch gặp sự cố trễ mạng với VNPay, nếu tiền trong tài khoản của bạn đã bị trừ nhưng trên web báo "Chờ thanh toán" hoặc không nhận được Email. Xin vui lòng <strong>liên lạc trực tiếp Hotline của TTA Movie trong vòng lớn nhất 30 phút</strong> để chúng tôi kịp thời đối soát thủ công và tạo mã vé cấp phát lại cho bạn.</li>
            <li><strong>Lỗi kỹ thuật hoặc hủy khung chiếu từ phía rạp:</strong> Nếu rạp TTA Movie có thay đổi lộ trình kỹ thuật dẫn tới việc chậm hoặc hủy phiên chiếu (sự cố cháy nổ, thiên tai, cúp điện từ điện lực,...), TTA Movie sẽ có thông báo và hoàn tiền 100% hoặc đổi vé cho suất chiếu trong tương lai tùy theo quyết định của Quý Khách.</li>
          </ul>

          <h2 className="text-lg font-bold text-white mt-10 mb-4">3. Đối soát thủ tục với Ngân hàng / VNPay</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Khi có yêu cầu hoàn tiền do sự cố hợp lệ, phương thức TTA hoàn tiền sẽ hoàn trả đúng vào Tài khoản/Thẻ /Ví điện tử khách hàng đã thực hiện đặt hàng.</li>
            <li>Thời gian hoàn tiền: Tùy thuộc vào hạ tầng xử lý của Ngân Hàng, thời gian xử lý refund tiêu chuẩn có thể kéo dài từ 5 đến 15 ngày làm việc. Quý khách vui lòng lưu ý thời gian dao động này.</li>
          </ul>

          <div className="mt-12 p-6 bg-primary/10 rounded-xl border border-primary/20 text-center">
            <h3 className="text-primary font-bold mb-2">HOTLINE HỖ TRỢ ĐỔI TRẢ, ĐỐI SOÁT KIẾM TRA LỖI KỸ THUẬT</h3>
            <p className="text-white/90 text-lg font-semibold tracking-wider">1900 6868</p>
            <p className="text-white/50 text-xs mt-2">Tổng đài hoạt động từ 8h00 tới 22h00 các ngày trong tuần, kể cả ngày lễ / Tết.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

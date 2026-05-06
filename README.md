# MovieBooking_tta

## 1. Tổng quan dự án

`MovieBooking_tta` là hệ thống đặt vé xem phim gồm:
- Backend ASP.NET Core Web API xử lý nghiệp vụ, xác thực, thanh toán và quản trị.
- Frontend React + Vite hiển thị giao diện người dùng, hỗ trợ đặt vé, xem lịch chiếu, đăng nhập và quản lý.

Dự án mô phỏng một ứng dụng đặt vé rạp phim đầy đủ tính năng cho bài bảo vệ đồ án.

## 2. Công nghệ chính

Backend:
- `.NET 8` / `ASP.NET Core`
- `Entity Framework Core` với SQL Server
- `JWT Bearer Authentication`
- `FluentValidation`
- `AutoMapper`
- `Swagger` cho tài liệu API

Frontend:
- `React 19`
- `Vite`
- `Tailwind CSS`
- `Axios`
- `React Router DOM`
- `@react-oauth/google` cho đăng nhập Google

## 3. Kiến trúc dự án

```
MovieBooking_tta/
├── backend/
│   ├── MovieBooking.Api/           # API, controller, middleware, cấu hình
│   ├── MovieBooking.Application/   # DTO, interface, validator, mapping
│   ├── MovieBooking.Infrastructure/# DbContext, repository, dịch vụ, migration
│   ├── MovieBooking.Domain/        # Entity, Enum, model cốt lõi
│   └── MovieBooking_tta.sln        # Solution file chung
└── frontend/
    ├── src/
    │   ├── components/            # Component React tái sử dụng
    │   ├── pages/                 # Trang người dùng
    │   ├── services/              # API client, business logic frontend
    │   ├── context/               # React Context và state toàn cục
    │   └── assets/                # CSS, hình ảnh, tài nguyên tĩnh
    ├── package.json
    ├── vite.config.js
    └── index.html
```

## 4. Các tính năng chính

### Người dùng
- Đăng ký, đăng nhập bằng email/mật khẩu
- Đăng nhập Google OAuth
- Khôi phục mật khẩu qua OTP
- Xem danh sách phim và lịch chiếu
- Chọn ghế, đặt vé và thanh toán
- Xem lịch sử đơn đặt vé cá nhân
- Hủy đơn đặt vé

### Quản trị (Admin)
- Xem thống kê: tổng phim, rạp, người dùng, doanh thu, đơn đặt
- Thống kê top phim và doanh thu theo ngày
- Xuất dữ liệu đơn đặt vé ra file CSV
- Cập nhật trạng thái đơn đặt vé

### Hỗ trợ nghiệp vụ
- Thanh toán qua VNPay
- Gửi email xác thực/khôi phục mật khẩu
- Middleware bắt lỗi chung (`ExceptionHandlingMiddleware`)
- Xử lý tự động huỷ đơn đặt vé quá hạn bằng `BackgroundService`
- API chat trợ lý (chat AI) với service `GeminiChatService`

## 5. Cấu trúc backend chi tiết

### Thư mục backend
- `MovieBooking.Api/`
  - `Program.cs`: cấu hình dịch vụ, JWT, CORS, Swagger, middleware.
  - `Controllers/`: `AuthController`, `BookingController`, `AdminController`, `PhimController`, `RapController`, `LichChieuController`, `KhuyenMaiController`, `PaymentController`, `ChatController`, `NguoiDungController`, v.v.
  - `Middlewares/`: xử lý lỗi chung.
  - `Services/`: background task và các service đặc thù.

- `MovieBooking.Application/`
  - `DTOs/`: các lớp dữ liệu gửi/nhận giữa client và API.
  - `Interfaces/`: interface cho service, repository, unit of work.
  - `Mappings/`: cấu hình AutoMapper.
  - `Validators/`: FluentValidation cho kiểm tra dữ liệu.

- `MovieBooking.Infrastructure/`
  - `Data/`: `MovieBookingDbContext`, cấu hình EF Core.
  - `Repositories/`: lớp truy cập dữ liệu chung và cụ thể.
  - `Services/`: thực thi logic service, thanh toán VNPay, email.

- `MovieBooking.Domain/`
  - `Entities/`: định nghĩa bảng, mối quan hệ.
  - `Enums/`: trạng thái đơn hàng, trạng thái phim, v.v.

## 6. Cấu trúc frontend

### Thư mục frontend
- `src/components/`: component tái sử dụng.
- `src/pages/`: các trang chính như Home, MovieDetail, Booking, Profile, Admin.
- `src/services/`: cấu hình Axios, gọi API, login, booking.
- `src/context/`: quản lý state chung như token, thông tin user.
- `src/assets/`: chứa CSS, hình ảnh và các tài nguyên frontend.

### Công nghệ UI
- Tailwind CSS giúp xây dựng giao diện nhanh, responsive.
- Vite chạy local server nhanh và hỗ trợ hot reload.
- React Router dùng điều hướng giữa các trang.

## 7. Các endpoint quan trọng

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google-login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/verify-otp`
- `POST /api/auth/reset-password`

### Booking
- `POST /api/bookings` - tạo đơn đặt vé
- `GET /api/bookings/{id}` - chi tiết đơn vé
- `GET /api/bookings/user/{userId}` - đơn vé theo người dùng
- `PUT /api/bookings/{id}/cancel` - hủy đơn đặt vé
- `GET /api/bookings` - danh sách đơn đặt vé (Admin)

### Quản trị
- `GET /api/admin/thong-ke` - thống kê dữ liệu quản trị
- `GET /api/admin/export/bookings` - xuất CSV đơn đặt vé
- `PUT /api/admin/bookings/{id}/status` - cập nhật trạng thái đơn vé

### Khác
- `POST /api/chat` (hoặc tương tự) - chat AI trợ lý
- API phim, lịch chiếu, rạp, khuyến mãi, người dùng, thanh toán theo các controller tương ứng

## 8. Hướng dẫn chạy dự án

### Backend
1. Mở `backend/MovieBooking_tta.sln` bằng Visual Studio hoặc chạy trong terminal.
2. Kiểm tra `backend/MovieBooking.Api/appsettings.json` và `appsettings.Development.json`:
   - `ConnectionStrings:DefaultConnection` tới SQL Server.
   - `JwtSettings`: `Issuer`, `Audience`, `Secret`.
   - `Cors:AllowedOrigins`: thêm `http://localhost:5173` nếu frontend chạy Vite.
3. Chạy migration hoặc tạo database nếu cần.
4. Chạy API:
   - Trong terminal: `cd backend/MovieBooking.Api` rồi `dotnet run`
   - Hoặc chạy từ Visual Studio bằng IIS Express / Project.
5. Mở Swagger (dev) tại `https://localhost:{port}/swagger` để kiểm tra API.

### Frontend
1. Mở terminal tại `frontend/`.
2. Cài dependencies:
   - `npm install`
3. Chạy ứng dụng:
   - `npm run dev`
4. Mở trình duyệt theo đường dẫn Vite cung cấp (thường `http://localhost:5173`).

## 9. Cấu hình môi trường cần nhớ

Backend cần:
- SQL Server connection string
- JWT secret
- VNPay thông tin nếu cài đặt thanh toán thật
- Email SMTP nếu gửi email
- CORS origin chính xác cho frontend

Frontend cần:
- URL API backend đúng
- Client ID Google OAuth nếu dùng đăng nhập Google

## 10. Những điểm quan trọng để ôn trước bảo vệ

- Kiến trúc 3 lớp backend: API / Application / Infrastructure
- Cách bảo mật token JWT và verify token version
- Cách chia controller cho từng nghiệp vụ: auth, booking, admin, film, promotion
- Cách frontend giao tiếp với backend qua Axios và React Router
- Cách xử lý lỗi trung tâm bằng `ExceptionHandlingMiddleware`
- Cơ chế tự động hủy đơn đặt vé quá hạn bằng `BackgroundService`
- Tại sao dùng `FluentValidation`, `AutoMapper`, `UnitOfWork`
- Luồng đặt vé: chọn phim -> chọn lịch chiếu -> chọn ghế -> tạo đơn -> thanh toán -> xác nhận
- Luồng admin: xem báo cáo -> xuất CSV -> cập nhật trạng thái đơn hàng

## 11. Gợi ý trả lời phỏng vấn

- "Tại sao tách `MovieBooking.Application` và `MovieBooking.Infrastructure`?"
  - Để tách phần định nghĩa nghiệp vụ (DTO, interface, validator) khỏi phần thực thi dữ liệu (DbContext, repository), giúp dễ bảo trì và test.

- "Cơ chế bảo mật JWT trong dự án ra sao?"
  - Dùng JWT Bearer, validate issuer/audience/lifetime/signing key. Token cũng kiểm tra `TokenVersion` để có thể invalid token khi user đăng xuất hoặc đổi mật khẩu.

- "Backend xử lý lỗi như thế nào?"
  - Dùng `ExceptionHandlingMiddleware` để bắt lỗi toàn cục và trả về response chuẩn, tránh leak thông tin nội bộ.

- "Frontend và backend có tương tác thế nào?"
  - Frontend gọi API bằng `Axios`, quản lý token trong context, gửi token qua header `Authorization: Bearer {token}`.

---

> README này đã sắp xếp theo cấu trúc rõ ràng, giúp bạn ôn tập nhanh các phần quan trọng của đồ án khi chuẩn bị bảo vệ.

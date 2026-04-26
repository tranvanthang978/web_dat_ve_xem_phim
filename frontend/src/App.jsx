import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Movies from './pages/Movies'
import AccountInfo from './pages/AccountInfo'
import MovieDetail from './pages/MovieDetail'
import BookingPage from './pages/BookingPage'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import AdminPhim from './pages/admin/AdminPhim'
import AdminRap from './pages/admin/AdminRap'
import AdminLichChieu from './pages/admin/AdminLichChieu'
import AdminDatVe from './pages/admin/AdminDatVe'
import AdminNguoiDung from './pages/admin/AdminNguoiDung'
import AdminKhuyenMai from './pages/admin/AdminKhuyenMai'
import KhuyenMai from './pages/KhuyenMai'
import MyTickets from './pages/MyTickets'
import ForgotPassword from './pages/ForgotPassword'
import ChatBox from './components/ChatBox'
import PaymentResult from './pages/PaymentResult'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
import RefundPolicy from './pages/RefundPolicy'

function ComingSoon({ title }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
        <p className="text-white/40">Trang này đang được phát triển</p>
      </div>
    </div>
  )
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="pt-16">{children}</main>
      <Footer />
    </>
  )
}

function AuthTransition({ children }) {
  return <div className="auth-page-in">{children}</div>
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

function AdminRoute({ children }) {
  const { user, token } = useAuth()
  if (!token) return <Navigate to="/dang-nhap" replace />
  if (user?.vaiTro !== 'Admin') return <Navigate to="/" replace />
  return children
}

// ChatBox chỉ hiện ở giao diện user (không hiện trong /admin)
function UserChatBox() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/admin')) return null
  return <ChatBox />
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          {/* Auth routes */}
          {/* Auth routes */}
          <Route path="/dang-nhap" element={<AuthTransition><Login /></AuthTransition>} />
          <Route path="/dang-ky" element={<AuthTransition><Register /></AuthTransition>} />
          <Route path="/quen-mat-khau" element={<AuthTransition><ForgotPassword /></AuthTransition>} />
          <Route path="/login" element={<AuthTransition><Login /></AuthTransition>} />
          <Route path="/register" element={<AuthTransition><Register /></AuthTransition>} />
          <Route path="/forgot-password" element={<AuthTransition><ForgotPassword /></AuthTransition>} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout><Dashboard /></AdminLayout></AdminRoute>} />
          <Route path="/admin/phim" element={<AdminRoute><AdminLayout><AdminPhim /></AdminLayout></AdminRoute>} />
          <Route path="/admin/rap" element={<AdminRoute><AdminLayout><AdminRap /></AdminLayout></AdminRoute>} />
          <Route path="/admin/lich-chieu" element={<AdminRoute><AdminLayout><AdminLichChieu /></AdminLayout></AdminRoute>} />
          <Route path="/admin/dat-ve" element={<AdminRoute><AdminLayout><AdminDatVe /></AdminLayout></AdminRoute>} />
          <Route path="/admin/nguoi-dung" element={<AdminRoute><AdminLayout><AdminNguoiDung /></AdminLayout></AdminRoute>} />
          <Route path="/admin/khuyenmai" element={<AdminRoute><AdminLayout><AdminKhuyenMai /></AdminLayout></AdminRoute>} />

          {/* Main routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/phim" element={<Layout><Movies /></Layout>} />
          <Route path="/phim/:id" element={<Layout><MovieDetail /></Layout>} />
          <Route path="/khuyen-mai" element={<Layout><KhuyenMai /></Layout>} />
          <Route path="/lien-he" element={<Layout><Contact /></Layout>} />
          <Route path="/faq" element={<Layout><FAQ /></Layout>} />
          <Route path="/chinh-sach" element={<Layout><RefundPolicy /></Layout>} />

          {/* Protected routes */}
          <Route path="/dat-ve/:lichChieuId" element={<Layout><ProtectedRoute><BookingPage /></ProtectedRoute></Layout>} />
          <Route path="/payment/result" element={<Layout><PaymentResult /></Layout>} />
          <Route path="/ve-cua-toi" element={<Navigate to="/tai-khoan?tab=tickets" replace />} />
          <Route path="/tai-khoan" element={<Layout><ProtectedRoute><AccountInfo /></ProtectedRoute></Layout>} />

          {/* 404 */}
          <Route path="*" element={<Layout><ComingSoon title="Trang không tồn tại" /></Layout>} />
        </Routes>
        <UserChatBox />
      </AuthProvider>
    </BrowserRouter>
  )
}

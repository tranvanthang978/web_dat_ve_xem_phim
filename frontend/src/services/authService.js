import api from './api'

const authService = {
  async login(tenDangNhap, matKhau) {
    const res = await api.post('/auth/login', {
      tenDangNhap,
      matKhau
    })
    return res.data
  },

  async register(hoTen, email, matKhau, xacNhanMatKhau, soDienThoai = '') {
    const res = await api.post('/auth/register', { hoTen, email, matKhau, xacNhanMatKhau, soDienThoai })
    return res.data
  },

  async forgotPassword(email) {
    const res = await api.post('/auth/forgot-password', { email })
    return res.data
  },

  async verifyOtp(email, otp) {
    const res = await api.post('/auth/verify-otp', { email, otp })
    return res.data
  },

  async resetPassword(email, otp, matKhauMoi) {
    const res = await api.post('/auth/reset-password', { email, otp, matKhauMoi })
    return res.data
  }
}

export default authService

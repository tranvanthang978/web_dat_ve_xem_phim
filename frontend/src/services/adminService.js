import api from './api'

const adminService = {
  getThongKe: () => api.get('/admin/thong-ke'),
  getAllBookings: () => api.get('/booking'),
  updateBookingStatus: (id, data) => api.put(`/admin/bookings/${id}/status`, data),
  getAllNguoiDung: () => api.get('/nguoidung'),
  updateVaiTro: (id, vaiTro) => api.put(`/nguoidung/${id}/vai-tro`, JSON.stringify(vaiTro), {
    headers: { 'Content-Type': 'application/json' }
  }),
  deleteNguoiDung: (id) => api.delete(`/nguoidung/${id}`),

  getAllPhim: () => api.get('/phim'),
  createPhim: (data) => api.post('/phim', data),
  updatePhim: (id, data) => api.put(`/phim/${id}`, data),
  deletePhim: (id) => api.delete(`/phim/${id}`),

  getAllRap: () => api.get('/rap'),
  createRap: (data) => api.post('/rap', data),
  updateRap: (id, data) => api.put(`/rap/${id}`, data),
  deleteRap: (id) => api.delete(`/rap/${id}`),
  getPhongChieu: (rapId) => api.get(`/rap/${rapId}/phong-chieu`),
  getPhongChieuById: (id) => api.get(`/rap/phong-chieu/${id}`),
  createPhongChieu: (data) => api.post('/rap/phong-chieu', data),
  updatePhongChieu: (id, data) => api.put(`/rap/phong-chieu/${id}`, data),
  deletePhongChieu: (id) => api.delete(`/rap/phong-chieu/${id}`),

  getLichChieuByPhim: (phimId) => api.get(`/lichchieu/phim/${phimId}`),
  createLichChieu: (data) => api.post('/lichchieu', data),
  updateLichChieu: (id, data) => api.put(`/lichchieu/${id}`, data),
  deleteLichChieu: (id) => api.delete(`/lichchieu/${id}`),

  getAllKhuyenMai: () => api.get('/khuyenmai'),
  createKhuyenMai: (data) => api.post('/khuyenmai', data),
  updateKhuyenMai: (id, data) => api.put(`/khuyenmai/${id}`, data),
  deleteKhuyenMai: (id) => api.delete(`/khuyenmai/${id}`),
}

export default adminService

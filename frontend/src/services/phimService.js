import api from './api'

const phimService = {
  async getAll() {
    const res = await api.get('/phim')
    return res.data
  },

  async getDangChieu() {
    const res = await api.get('/phim/dang-chieu')
    return res.data
  },

  async getById(id) {
    const res = await api.get(`/phim/${id}`)
    return res.data
  },
}

export default phimService

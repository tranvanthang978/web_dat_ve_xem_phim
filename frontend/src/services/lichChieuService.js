import api from './api'

const lichChieuService = {
  async getByPhimId(phimId) {
    const res = await api.get(`/lichchieu/phim/${phimId}`)
    return res.data
  },

  async getById(id) {
    const res = await api.get(`/lichchieu/${id}`)
    return res.data
  },

  async getByRapId(rapId) {
    const res = await api.get(`/lichchieu/rap/${rapId}`)
    return res.data
  },

  async getGheByLichChieu(lichChieuId) {
    const res = await api.get(`/lichchieu/${lichChieuId}/ghes`)
    return res.data
  },
}

export default lichChieuService

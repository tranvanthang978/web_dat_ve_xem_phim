import api from './api'

const rapService = {
  async getAll() {
    const res = await api.get('/rap')
    return res.data
  },

  async getById(id) {
    const res = await api.get(`/rap/${id}`)
    return res.data
  },

  async getPhongChieuByRapId(rapId) {
    const res = await api.get(`/rap/${rapId}/phong-chieu`)
    return res.data
  },
}

export default rapService

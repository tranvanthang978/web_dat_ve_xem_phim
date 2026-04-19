import api from './api'

const bookingService = {
  async create(data) {
    const res = await api.post('/booking', data)
    return res.data
  },

  async getByUser(userId) {
    const res = await api.get(`/booking/user/${userId}`)
    return res.data
  },

  async getById(id) {
    const res = await api.get(`/booking/${id}`)
    return res.data
  },

  async cancel(id) {
    const res = await api.put(`/booking/${id}/cancel`)
    return res.data
  },
}

export default bookingService

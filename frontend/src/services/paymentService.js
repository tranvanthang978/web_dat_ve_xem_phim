import api from './api'

const paymentService = {
  createVNPayUrl: (donDatVeId) =>
    api.post('/payment/vnpay/create', { donDatVeId }),
  getBankTransferInfo: (donDatVeId) =>
    api.get(`/payment/bank-transfer/info/${donDatVeId}`),
  confirmBankTransfer: (donDatVeId) =>
    api.post('/payment/bank-transfer/confirm', { donDatVeId }),
}

export default paymentService

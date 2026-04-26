import { useState, useEffect } from 'react'
import adminService from '../../services/adminService'

const fmtDate = (d) => {
  if (!d) return '—'
  // Nếu không có timezone info, parse như local time
  const date = (d.endsWith('Z') || d.includes('+')) ? new Date(d) : new Date(d.replace('T', ' '))
  return date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
const fmtMoney = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ'

export default function AdminLichChieu() {
  const [phims, setPhims] = useState([])
  const [raps, setRaps] = useState([])
  const [selectedPhim, setSelectedPhim] = useState('')
  const [lichChieus, setLichChieus] = useState([])
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState(null) // null = create, number = edit
  const [form, setForm] = useState({ gioBatDau: '', gioKetThuc: '', giaCoBan: 80000, phimId: 0, phongChieuId: 0 })
  const [phongChieus, setPhongChieus] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    // PhimController trả về array thẳng (không wrap ApiResponse)
    adminService.getAllPhim()
      .then(res => setPhims(Array.isArray(res.data) ? res.data : (res.data?.data || [])))
      .catch(() => {})
    // RapController trả về ApiResponse wrapper
    adminService.getAllRap()
      .then(res => setRaps(res.data?.data || res.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedPhim) { setLichChieus([]); return }
    setLoading(true)
    adminService.getLichChieuByPhim(selectedPhim)
      .then(res => {
        // Backend trả về array trực tiếp, không wrap ApiResponse
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || res.data || [])
        setLichChieus(data)
      })
      .catch(() => setLichChieus([]))
      .finally(() => setLoading(false))
  }, [selectedPhim])

  const handleRapChange = (rapId) => {
    setForm(p => ({ ...p, phongChieuId: 0 }))
    if (!rapId) { setPhongChieus([]); return }
    adminService.getPhongChieu(rapId).then(res => setPhongChieus(res.data?.data || res.data || [])).catch(() => {})
  }

  const openModal = () => {
    setForm({ gioBatDau: '', gioKetThuc: '', giaCoBan: 80000, phimId: Number(selectedPhim) || 0, phongChieuId: 0 })
    setPhongChieus([]); setError(''); setEditId(null)
    setModal(true)
  }

  const openEdit = (l) => {
    // Chuyển datetime string về format datetime-local (YYYY-MM-DDTHH:mm)
    const toLocal = (s) => {
      if (!s) return ''
      const d = (s.endsWith('Z') || s.includes('+')) ? new Date(s) : new Date(s.replace('T', ' '))
      return d.toISOString().slice(0, 16)
    }
    setForm({
      gioBatDau:    toLocal(l.gioBatDau),
      gioKetThuc:   toLocal(l.gioKetThuc),
      giaCoBan:     l.giaCoBan,
      phimId:       l.phimId,
      phongChieuId: l.phongChieuId,
    })
    // Load phòng chiếu của rạp tương ứng
    if (l.phongChieuId) {
      adminService.getPhongChieuById(l.phongChieuId).then(res => {
        const pc = res.data?.data || res.data
        if (pc?.rapId) {
          adminService.getPhongChieu(pc.rapId).then(r => setPhongChieus(r.data?.data || r.data || []))
        }
      }).catch(() => {})
    }
    setError(''); setEditId(l.id)
    setModal(true)
  }

  const reloadLichChieu = () => {
    if (!selectedPhim) return
    adminService.getLichChieuByPhim(selectedPhim).then(res => {
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || res.data || [])
      setLichChieus(data)
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.phimId || !form.phongChieuId || !form.gioBatDau || !form.gioKetThuc) {
      setError('Vui lòng điền đầy đủ thông tin'); return
    }
    setSaving(true); setError('')
    const payload = {
      ...form,
      gioBatDau:  form.gioBatDau + ':00',
      gioKetThuc: form.gioKetThuc + ':00',
    }
    try {
      if (editId) {
        await adminService.updateLichChieu(editId, payload)
      } else {
        await adminService.createLichChieu(payload)
      }
      reloadLichChieu()
      setModal(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await adminService.deleteLichChieu(deleteId)
      setLichChieus(prev => prev.filter(l => l.id !== deleteId))
      setDeleteId(null)
      setDeleteError('')
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Không thể xóa lịch chiếu này')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Lịch chiếu</h1>
          <p className="text-sm text-white/40 mt-0.5">Quản lý lịch chiếu phim</p>
        </div>
        <button onClick={openModal} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm lịch chiếu
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={selectedPhim}
          onChange={e => setSelectedPhim(e.target.value)}
          className="bg-[#1a1a1a] border border-white/10 text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
        >
          <option value="">-- Chọn phim --</option>
          {phims.map(p => <option key={p.id} value={p.id}>{p.tenPhim}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
        {!selectedPhim ? (
          <div className="text-center py-16 text-white/20 text-sm">Chọn phim để xem lịch chiếu</div>
        ) : loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Giờ bắt đầu</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Giờ kết thúc</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden md:table-cell">Phòng chiếu</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden lg:table-cell">Rạp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Giá</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {lichChieus.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-white/30">Chưa có lịch chiếu</td></tr>
              ) : lichChieus.map(l => (
                <tr key={l.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-white">{fmtDate(l.gioBatDau)}</td>
                  <td className="px-4 py-3 text-white/60">{fmtDate(l.gioKetThuc)}</td>
                  <td className="px-4 py-3 text-white/60 hidden md:table-cell">{l.tenPhong}</td>
                  <td className="px-4 py-3 text-white/60 hidden lg:table-cell">{l.tenRap}</td>
                  <td className="px-4 py-3 text-primary font-medium">{fmtMoney(l.giaCoBan)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEdit(l)} className="text-white/40 hover:text-white transition-colors p-1.5 rounded hover:bg-white/5" title="Sửa">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => setDeleteId(l.id)} className="text-white/40 hover:text-red-400 transition-colors p-1.5 rounded hover:bg-red-400/5" title="Xóa">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-base font-bold text-white">{editId ? 'Sửa lịch chiếu' : 'Thêm lịch chiếu'}</h2>
              <button onClick={() => setModal(false)} className="text-white/40 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">{error}</p>}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Phim *</label>
                <select value={form.phimId} onChange={e => setForm(p => ({...p, phimId: Number(e.target.value)}))} className="input-field text-sm">
                  <option value={0}>-- Chọn phim --</option>
                  {phims.map(p => <option key={p.id} value={p.id}>{p.tenPhim}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Rạp *</label>
                <select onChange={e => handleRapChange(e.target.value)} className="input-field text-sm">
                  <option value="">-- Chọn rạp --</option>
                  {raps.map(r => <option key={r.id} value={r.id}>{r.tenRap}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Phòng chiếu *</label>
                <select value={form.phongChieuId} onChange={e => setForm(p => ({...p, phongChieuId: Number(e.target.value)}))} className="input-field text-sm">
                  <option value={0}>-- Chọn phòng --</option>
                  {phongChieus.map(p => <option key={p.id} value={p.id}>{p.tenPhong}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Giờ bắt đầu *</label>
                  <input
                    type="datetime-local"
                    value={form.gioBatDau}
                    onChange={e => setForm(p => ({...p, gioBatDau: e.target.value}))}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Giờ kết thúc *</label>
                  <input
                    type="datetime-local"
                    value={form.gioKetThuc}
                    onChange={e => setForm(p => ({...p, gioKetThuc: e.target.value}))}
                    className="input-field text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Giá cơ bản (VNĐ)</label>
                <input type="number" value={form.giaCoBan} onChange={e => setForm(p => ({...p, giaCoBan: Number(e.target.value)}))} className="input-field text-sm" min={1000} step={1000} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-outline text-sm px-5 py-2">Hủy</button>
                <button type="submit" disabled={saving} className="btn-primary text-sm px-5 py-2 disabled:opacity-60">
                  {saving ? 'Đang lưu...' : editId ? 'Lưu thay đổi' : 'Thêm lịch chiếu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center">
            {deleteError ? (
              <>
                <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white mb-2">Không thể xóa</h3>
                <p className="text-sm text-yellow-400 mb-6">{deleteError}</p>
                <button onClick={() => { setDeleteId(null); setDeleteError('') }}
                  className="w-full btn-primary text-sm py-2">Đóng</button>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-white mb-2">Xóa lịch chiếu?</h3>
                <p className="text-sm text-white/40 mb-6">Hành động này không thể hoàn tác.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteId(null)} className="flex-1 btn-outline text-sm py-2.5">Hủy</button>
                  <button onClick={handleDelete} className="flex-1 btn-primary text-sm py-2.5 bg-red-500 hover:bg-red-600">Xóa</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


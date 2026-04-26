import { useState, useEffect } from 'react'
import adminService from '../../services/adminService'
import Pagination from '../../components/Pagination'

const fmtDate = (d) => new Date(d).toLocaleDateString('vi-VN')
const fmtMoney = (n) => new Intl.NumberFormat('vi-VN').format(n) + '%'

const EMPTY = { maKhuyenMai: '', giaTriGiam: 10, ngayBatDau: '', ngayKetThuc: '', conHieuLuc: true, soLuotSuDung: 0, giamToiDa: 0 }

export default function AdminKhuyenMai() {
  const [khuyenMais, setKhuyenMais] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [deleteId, setDeleteId] = useState(null)
  const [detail, setDetail] = useState(null)

  const load = () => {
    setLoading(true)
    adminService.getAllKhuyenMai()
      .then(res => setKhuyenMais(Array.isArray(res.data) ? res.data : (res.data?.data || [])))
      .catch(() => setKhuyenMais([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setError(''); setModal({ mode: 'create' }) }
  const openEdit = (k) => { setForm({ ...k }); setError(''); setModal({ mode: 'edit', id: k.id }) }
  const closeModal = () => setModal(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.maKhuyenMai.trim()) { setError('Vui lòng nhập mã khuyến mại'); return }
    if (!form.ngayBatDau || !form.ngayKetThuc) { setError('Vui lòng chọn ngày bắt đầu và kết thúc'); return }
    if (form.giaTriGiam <= 0 || form.giaTriGiam > 100) { setError('Giá trị giảm phải từ 1-100%'); return }

    setSaving(true); setError('')

    const payload = {
      ...form,
      giaTriGiam: parseFloat(form.giaTriGiam) || 10,
      ngayBatDau: new Date(form.ngayBatDau).toISOString(),
      ngayKetThuc: new Date(form.ngayKetThuc).toISOString(),
    }

    try {
      if (modal.mode === 'create') {
        await adminService.createKhuyenMai(payload)
      } else {
        await adminService.updateKhuyenMai(modal.id, payload)
      }
      load(); closeModal()
    } catch (err) {
      const d = err.response?.data
      if (d?.errors) {
        const msgs = Object.values(d.errors).flat().join(', ')
        setError(msgs)
      } else {
        setError(d?.message || `Lỗi ${err.response?.status || 'kết nối'}: Không thể lưu khuyến mại`)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await adminService.deleteKhuyenMai(deleteId)
      load()
    } catch (e) { console.error(e) }
    setDeleteId(null)
  }

  const filtered = khuyenMais.filter(k => k.maKhuyenMai?.toLowerCase().includes(search.toLowerCase()))
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage(1)
  }, [search])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Quản lý khuyến mại</h1>
          <p className="text-sm text-white/40 mt-0.5">{khuyenMais.length} khuyến mại trong hệ thống</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm khuyến mại
        </button>
      </div>

      {/* Search */}
      <div className="relative w-72">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm mã khuyến mại..."
          className="w-full bg-[#1a1a1a] border border-white/10 text-sm text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary transition-colors placeholder-white/30"
        />
        <svg className="absolute left-3 top-2.5 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Mã khuyến mại</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden md:table-cell">Giá trị giảm</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden lg:table-cell">Từ ngày</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden lg:table-cell">Đến ngày</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden lg:table-cell">Lượt dùng</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Trạng thái</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-white/30">Chưa có khuyến mại</td></tr>
              ) : pageItems.map(k => (
                <tr key={k.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={() => setDetail(k)} className="text-white hover:text-white/80 font-medium transition-colors">
                      {k.maKhuyenMai}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-primary hidden md:table-cell">{fmtMoney(k.giaTriGiam)}</td>
                  <td className="px-4 py-3 text-white/60 hidden lg:table-cell">{fmtDate(k.ngayBatDau)}</td>
                  <td className="px-4 py-3 text-white/60 hidden lg:table-cell">{fmtDate(k.ngayKetThuc)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-white/60 text-sm">
                      {k.soLuotDaDung ?? 0}
                      {k.soLuotSuDung > 0 ? `/${k.soLuotSuDung}` : ' / ∞'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 text-xs rounded ${k.conHieuLuc ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {k.conHieuLuc ? 'Có hiệu lực' : 'Hết hiệu lực'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(k)} className="text-white/40 hover:text-primary transition-colors p-1.5 rounded hover:bg-primary/5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => setDeleteId(k.id)} className="text-white/40 hover:text-red-400 transition-colors p-1.5 rounded hover:bg-red-400/5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Pagination page={page} pageSize={pageSize} total={filtered.length} onChange={setPage} />

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-base font-bold text-white">{modal.mode === 'create' ? 'Thêm khuyến mại' : 'Chỉnh sửa khuyến mại'}</h2>
              <button onClick={closeModal} className="text-white/40 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">{error}</p>}
              
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Mã khuyến mại *</label>
                <input type="text" name="maKhuyenMai" value={form.maKhuyenMai} onChange={handleChange} className="input-field text-sm" placeholder="VD: SUMMER20, NEWYEAR10..." />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Giá trị giảm (%) * (1-100)</label>
                <input type="number" name="giaTriGiam" value={form.giaTriGiam} onChange={handleChange} className="input-field text-sm" min={1} max={100} step={1} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Ngày bắt đầu *</label>
                  <input type="date" name="ngayBatDau" value={form.ngayBatDau.split('T')[0]} onChange={e => setForm(p => ({...p, ngayBatDau: e.target.value}))} className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Ngày kết thúc *</label>
                  <input type="date" name="ngayKetThuc" value={form.ngayKetThuc.split('T')[0]} onChange={e => setForm(p => ({...p, ngayKetThuc: e.target.value}))} className="input-field text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Số lượt sử dụng <span className="text-white/30">(0 = không giới hạn)</span></label>
                <input type="number" name="soLuotSuDung" value={form.soLuotSuDung} onChange={handleChange} className="input-field text-sm" min={0} step={1} placeholder="0" />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Giảm tối đa (đ) <span className="text-white/30">(0 = không giới hạn)</span></label>
                <input type="number" name="giamToiDa" value={form.giamToiDa} onChange={handleChange} className="input-field text-sm" min={0} step={1000} placeholder="0" />
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="conHieuLuc" name="conHieuLuc" checked={form.conHieuLuc} onChange={handleChange} className="w-4 h-4 rounded" />
                <label htmlFor="conHieuLuc" className="text-sm text-white/70 cursor-pointer">Có hiệu lực</label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-outline text-sm px-5 py-2">Hủy</button>
                <button type="submit" disabled={saving} className="btn-primary text-sm px-5 py-2 disabled:opacity-60">
                  {saving ? 'Đang lưu...' : (modal.mode === 'create' ? 'Thêm khuyến mại' : 'Cập nhật')}
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
            <h3 className="text-base font-bold text-white mb-2">Xóa khuyến mại?</h3>
            <p className="text-sm text-white/40 mb-6">Hành động này không thể hoàn tác.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setDeleteId(null)} className="w-full border border-white/20 hover:border-white/40 text-white font-semibold text-sm py-3 rounded-2xl transition-colors">Hủy</button>
              <button onClick={handleDelete} className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold text-sm py-3 rounded-2xl transition-colors">Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-base font-bold text-white">Chi tiết khuyến mại</h2>
              <button onClick={() => setDetail(null)} className="text-white/40 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Mã khuyến mại</label>
                <p className="text-lg font-bold text-primary mt-1">{detail.maKhuyenMai}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Giá trị giảm</label>
                  <p className="text-lg font-bold text-white mt-1">{fmtMoney(detail.giaTriGiam)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Trạng thái</label>
                  <p className="mt-1">
                    <span className={`inline-block px-2 py-1 text-xs rounded ${detail.conHieuLuc ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {detail.conHieuLuc ? 'Có hiệu lực' : 'Hết hiệu lực'}
                    </span>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Lượt đã dùng</label>
                  <p className="text-white mt-1 font-semibold">{detail.soLuotDaDung ?? 0}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Giới hạn lượt</label>
                  <p className="text-white mt-1 font-semibold">{detail.soLuotSuDung > 0 ? detail.soLuotSuDung : 'Không giới hạn'}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Giảm tối đa</label>
                <p className="text-white mt-1 font-semibold">
                  {detail.giamToiDa > 0 ? new Intl.NumberFormat('vi-VN').format(detail.giamToiDa) + 'đ' : 'Không giới hạn'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Từ ngày</label>
                  <p className="text-white mt-1">{fmtDate(detail.ngayBatDau)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Đến ngày</label>
                  <p className="text-white mt-1">{fmtDate(detail.ngayKetThuc)}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => { setDetail(null); openEdit(detail) }} className="flex-1 btn-primary text-sm py-2">Chỉnh sửa</button>
                <button onClick={() => setDetail(null)} className="flex-1 btn-outline text-sm py-2.5">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


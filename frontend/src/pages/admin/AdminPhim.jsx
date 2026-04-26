import { useState, useEffect } from 'react'
import adminService from '../../services/adminService'
import Pagination from '../../components/Pagination'

const EMPTY = { tenPhim: '', moTa: '', trailerUrl: '', posterUrl: '', backdropUrl: '', theLoai: '', xepHang: 0, daoDien: '', dienVien: '', thoiLuong: 90, dangChieu: false }

export default function AdminPhim() {
  const [phims, setPhims] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | { mode: 'create'|'edit', data }
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [deleteId, setDeleteId] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  const load = () => {
    setLoading(true)
    adminService.getAllPhim()
      .then(res => setPhims(Array.isArray(res.data) ? res.data : (res.data?.data || [])))
      .catch(() => setPhims([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setError(''); setModal({ mode: 'create' }) }
  const openView = (p) => { setError(''); setModal({ mode: 'view', data: p }) }
  const openEdit = (p) => { setForm({ ...EMPTY, ...p, backdropUrl: p.backdropUrl || '' }); setError(''); setModal({ mode: 'edit', id: p.id }) }
  const closeModal = () => setModal(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.tenPhim.trim()) { setError('Vui lòng nhập tên phim'); return }
    setSaving(true); setError('')

    // Đảm bảo kiểu dữ liệu đúng trước khi gửi
    const payload = {
      ...form,
      thoiLuong: parseInt(form.thoiLuong) || 90,
      xepHang: parseFloat(form.xepHang) || 0,
    }

    try {
      if (modal.mode === 'create') {
        await adminService.createPhim(payload)
      } else {
        await adminService.updatePhim(modal.id, payload)
      }
      load(); closeModal()
    } catch (err) {
      console.error('Create/Update phim error:', err.response?.status, err.response?.data)
      const d = err.response?.data
      // Xử lý cả ProblemDetails (validation) lẫn ApiResponse
      if (d?.errors) {
        const msgs = Object.values(d.errors).flat().join(', ')
        setError(msgs)
      } else {
        setError(d?.message || d?.title || `Lỗi ${err.response?.status || 'kết nối'}: Không thể lưu phim`)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await adminService.deletePhim(deleteId)
      load()
      setDeleteId(null)
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể xóa phim này'
      setDeleteError(msg)
    }
  }

  const filtered = phims.filter(p => p.tenPhim?.toLowerCase().includes(search.toLowerCase()))
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage(1)
  }, [search])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Quản lý phim</h1>
          <p className="text-sm text-white/40 mt-0.5">{phims.length} phim trong hệ thống</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm phim
        </button>
      </div>

      {/* Search */}
      <div className="relative w-72">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm kiếm phim..."
          className="input-field text-sm pr-9"
        />
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Phim</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden md:table-cell">Thể loại</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden lg:table-cell">Thời lượng</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Trạng thái</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-white/30">Không có phim nào</td></tr>
              ) : pageItems.map(p => (
                <tr key={p.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.posterUrl ? (
                        <img src={p.posterUrl} alt="" className="w-8 h-12 object-cover rounded" onError={e => e.target.style.display='none'} />
                      ) : (
                        <div className="w-8 h-12 bg-white/5 rounded" />
                      )}
                      <div>
                        <p className="font-medium text-white line-clamp-1">{p.tenPhim}</p>
                        <p className="text-xs text-white/30 line-clamp-1">{p.daoDien}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/60 hidden md:table-cell">{p.theLoai || '—'}</td>
                  <td className="px-4 py-3 text-white/60 hidden lg:table-cell">{p.thoiLuong} phút</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.dangChieu ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                      {p.dangChieu ? 'Đang chiếu' : 'Sắp chiếu'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openView(p)} className="text-white/40 hover:text-blue-400 transition-colors p-1.5 rounded hover:bg-blue-400/5" title="Xem chi tiết">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button onClick={() => openEdit(p)} className="text-white/40 hover:text-white transition-colors p-1.5 rounded hover:bg-white/5" title="Chỉnh sửa">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => setDeleteId(p.id)} className="text-white/40 hover:text-red-400 transition-colors p-1.5 rounded hover:bg-red-400/5" title="Xóa">
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
      <Pagination page={page} pageSize={pageSize} total={filtered.length} onChange={setPage} />

      {/* Modal Create/Edit */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">
                {modal.mode === 'view' ? 'Chi tiết phim' : modal.mode === 'create' ? 'Thêm phim mới' : 'Chỉnh sửa phim'}
              </h2>
              <button onClick={closeModal} className="text-white/40 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {modal.mode === 'view' ? (
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  {modal.data.posterUrl ? (
                    <img src={modal.data.posterUrl} alt="" className="w-14 h-20 object-cover rounded shrink-0" onError={e => e.target.style.display='none'} />
                  ) : (
                    <div className="w-14 h-20 rounded bg-primary/20 flex items-center justify-center text-primary text-xl font-bold shrink-0">
                      {modal.data.tenPhim?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <p className="text-base font-bold text-white">{modal.data.tenPhim}</p>
                    <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${modal.data.dangChieu ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                      {modal.data.dangChieu ? 'Đang chiếu' : 'Sắp chiếu'}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  <Row label="ID" value={`#${modal.data.id}`} />
                  <Row label="Thể loại" value={modal.data.theLoai || '—'} />
                  <Row label="Thời lượng" value={`${modal.data.thoiLuong} phút`} />
                  <Row label="Đạo diễn" value={modal.data.daoDien || '—'} />
                  <Row label="Diễn viên" value={modal.data.dienVien || '—'} />
                  <Row label="Xếp hạng" value={`${modal.data.xepHang} / 5`} />
                  <Row label="Ngày tạo" value={modal.data.ngayTao ? new Date(modal.data.ngayTao).toLocaleDateString('vi-VN') : '—'} />
                  <Row label="Cập nhật" value={modal.data.ngayCapNhat ? new Date(modal.data.ngayCapNhat).toLocaleDateString('vi-VN') : '—'} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={closeModal} className="btn-outline text-sm px-5 py-2">Đóng</button>
                </div>
              </div>
            ) : (
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">{error}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Tên phim *</label>
                  <input name="tenPhim" value={form.tenPhim} onChange={handleChange} className="input-field text-sm" placeholder="Tên phim" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Thể loại</label>
                  <input name="theLoai" value={form.theLoai} onChange={handleChange} className="input-field text-sm" placeholder="Hành động, Kinh dị..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Thời lượng (phút)</label>
                  <input name="thoiLuong" type="number" value={form.thoiLuong} onChange={handleChange} className="input-field text-sm" min={1} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Đạo diễn</label>
                  <input name="daoDien" value={form.daoDien} onChange={handleChange} className="input-field text-sm" placeholder="Tên đạo diễn" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Xếp hạng (0-5)</label>
                  <input name="xepHang" type="number" value={form.xepHang} onChange={handleChange} className="input-field text-sm" min={0} max={5} step={0.1} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Diễn viên</label>
                  <input name="dienVien" value={form.dienVien} onChange={handleChange} className="input-field text-sm" placeholder="Tên diễn viên" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Poster URL</label>
                  <input name="posterUrl" value={form.posterUrl} onChange={handleChange} className="input-field text-sm" placeholder="https://..." />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Backdrop URL <span className="text-white/25">(ảnh ngang cho banner)</span></label>
                  <input name="backdropUrl" value={form.backdropUrl || ''} onChange={handleChange} className="input-field text-sm" placeholder="https://... (ảnh ngang 16:9)" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Trailer URL</label>
                  <input name="trailerUrl" value={form.trailerUrl} onChange={handleChange} className="input-field text-sm" placeholder="https://youtube.com/..." />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Mô tả</label>
                  <textarea name="moTa" value={form.moTa} onChange={handleChange} className="input-field text-sm resize-none" rows={4} placeholder="Mô tả nội dung phim" style={{maxHeight: '120px', overflowY: 'auto'}} />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="dangChieu" name="dangChieu" checked={form.dangChieu} onChange={handleChange} className="w-4 h-4 accent-primary" />
                  <label htmlFor="dangChieu" className="text-sm text-white/70">Đang chiếu</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-outline text-sm px-5 py-2">Hủy</button>
                <button type="submit" disabled={saving} className="btn-primary text-sm px-5 py-2 disabled:opacity-60">
                  {saving ? 'Đang lưu...' : modal.mode === 'create' ? 'Thêm phim' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
            )}
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
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white mb-2">Xóa phim?</h3>
                <p className="text-sm text-white/40 mb-6">Hành động này không thể hoàn tác.</p>
                <div className="flex gap-3">
                  <button onClick={() => { setDeleteId(null); setDeleteError('') }}
                    className="flex-1 btn-outline text-sm py-2.5">Hủy</button>
                  <button onClick={handleDelete}
                    className="flex-1 btn-primary text-sm py-2.5 bg-red-500 hover:bg-red-600">Xóa</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5">
      <span className="text-xs text-white/40">{label}</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  )
}

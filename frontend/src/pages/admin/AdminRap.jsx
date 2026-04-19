import { useState, useEffect } from 'react'
import adminService from '../../services/adminService'
import Pagination from '../../components/Pagination'

const EMPTY_RAP = { tenRap: '', diaChi: '', hotline: '' }
const EMPTY_PHONG = { tenPhong: '', rapId: 0, soHangGhe: 8, soGheMotHang: 10 }

export default function AdminRap() {
  const [raps, setRaps] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRap, setSelectedRap] = useState(null)
  const [phongChieus, setPhongChieus] = useState([])
  const [loadingPhong, setLoadingPhong] = useState(false)
  const [rapPage, setRapPage] = useState(1)
  const rapPageSize = 8
  const [phongPage, setPhongPage] = useState(1)
  const phongPageSize = 6

  const [rapModal, setRapModal] = useState(null)
  const [rapForm, setRapForm] = useState(EMPTY_RAP)
  const [phongModal, setPhongModal] = useState(null) // null | { mode: 'create' | 'edit', id?: number }
  const [phongForm, setPhongForm] = useState(EMPTY_PHONG)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteRapId, setDeleteRapId] = useState(null)
  const [deletePhongId, setDeletePhongId] = useState(null)
  const [deletePhongError, setDeletePhongError] = useState('')
  const [detail, setDetail] = useState(null)
  const [seedModal, setSeedModal] = useState(null) // { phongId, tenPhong }
  const [seedForm, setSeedForm] = useState({ soHangGhe: 8, soGheMotHang: 10 })
  const [seedLoading, setSeedLoading] = useState(false)
  const [seedError, setSeedError] = useState('')

  const loadRaps = () => {
    setLoading(true)
    adminService.getAllRap()
      .then(res => setRaps(res.data?.data || res.data || []))
      .catch(() => setRaps([]))
      .finally(() => setLoading(false))
  }

  const loadPhong = (rapId) => {
    setLoadingPhong(true)
    adminService.getPhongChieu(rapId)
      .then(res => setPhongChieus(res.data?.data || res.data || []))
      .catch(() => setPhongChieus([]))
      .finally(() => setLoadingPhong(false))
  }

  useEffect(() => { loadRaps() }, [])

  const selectRap = (rap) => {
    setSelectedRap(rap)
    setPhongPage(1)
    loadPhong(rap.id)
  }

  // Rap CRUD
  const openCreateRap = () => { setRapForm(EMPTY_RAP); setError(''); setRapModal({ mode: 'create' }) }
  const openEditRap = (r) => { setRapForm({ tenRap: r.tenRap, diaChi: r.diaChi, hotline: r.hotline }); setError(''); setRapModal({ mode: 'edit', id: r.id }) }

  const handleSaveRap = async (e) => {
    e.preventDefault()
    if (!rapForm.tenRap.trim()) { setError('Vui lòng nhập tên rạp'); return }
    setSaving(true); setError('')
    try {
      if (rapModal.mode === 'create') await adminService.createRap(rapForm)
      else await adminService.updateRap(rapModal.id, rapForm)
      loadRaps(); setRapModal(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally { setSaving(false) }
  }

  const handleDeleteRap = async () => {
    if (!deleteRapId) return
    try { await adminService.deleteRap(deleteRapId); loadRaps(); if (selectedRap?.id === deleteRapId) setSelectedRap(null) }
    catch {}
    setDeleteRapId(null)
  }

  // PhongChieu CRUD
  const openCreatePhong = () => {
    setPhongForm({ ...EMPTY_PHONG, rapId: selectedRap?.id || 0 })
    setError(''); setPhongModal({ mode: 'create' })
  }

  const openEditPhong = (p) => {
    setPhongForm({ ...p, rapId: selectedRap?.id || p.rapId })
    setError(''); setPhongModal({ mode: 'edit', id: p.id })
  }

  const handleSavePhong = async (e) => {
    e.preventDefault()
    if (!phongForm.tenPhong.trim()) { setError('Vui lòng nhập tên phòng'); return }
    setSaving(true); setError('')
    try {
      if (phongModal?.mode === 'edit' && phongModal.id) {
        await adminService.updatePhongChieu(phongModal.id, {
          tenPhong: phongForm.tenPhong,
          soHangGhe: phongForm.soHangGhe,
          soGheMotHang: phongForm.soGheMotHang,
          rapId: phongForm.rapId
        })
      } else {
        await adminService.createPhongChieu(phongForm)
      }
      loadPhong(selectedRap.id)
      setPhongModal(null)
      setDetail(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally { setSaving(false) }
  }

  const handleDeletePhong = async () => {
    if (!deletePhongId) return
    try {
      await adminService.deletePhongChieu(deletePhongId)
      loadPhong(selectedRap.id)
      setDeletePhongId(null)
      setDeletePhongError('')
    } catch (err) {
      setDeletePhongError(err.response?.data?.message || 'Không thể xóa phòng chiếu này')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Quản lý rạp</h1>
          <p className="text-sm text-white/40 mt-0.5">{raps.length} rạp trong hệ thống</p>
        </div>
        <button onClick={openCreateRap} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm rạp
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Danh sách rạp */}
        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white">Danh sách rạp</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : raps.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">Chưa có rạp nào</div>
          ) : (
            <>
              <div className="divide-y divide-white/5">
                {raps.slice((rapPage - 1) * rapPageSize, rapPage * rapPageSize).map(r => (
                  <div
                    key={r.id}
                    onClick={() => selectRap(r)}
                    className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between group ${selectedRap?.id === r.id ? 'bg-primary/10' : 'hover:bg-white/3'}`}
                  >
                    <div>
                      <p className={`text-sm font-medium ${selectedRap?.id === r.id ? 'text-primary' : 'text-white'}`}>{r.tenRap}</p>
                      <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{r.diaChi}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => { e.stopPropagation(); openEditRap(r) }} className="p-1.5 text-white/40 hover:text-white rounded hover:bg-white/5 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={e => { e.stopPropagation(); setDeleteRapId(r.id) }} className="p-1.5 text-white/40 hover:text-red-400 rounded hover:bg-red-400/5 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3">
                <Pagination page={rapPage} pageSize={rapPageSize} total={raps.length} onChange={setRapPage} />
              </div>
            </>
          )}
        </div>

        {/* Phòng chiếu */}
        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">
              {selectedRap ? `Phòng chiếu — ${selectedRap.tenRap}` : 'Phòng chiếu'}
            </h3>
            {selectedRap && (
              <button onClick={openCreatePhong} className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm phòng
              </button>
            )}
          </div>
          {!selectedRap ? (
            <div className="text-center py-12 text-white/20 text-sm">Chọn một rạp để xem phòng chiếu</div>
          ) : loadingPhong ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : phongChieus.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">Chưa có phòng chiếu nào</div>
          ) : (
            <>
              <div className="divide-y divide-white/5">
                {phongChieus.slice((phongPage - 1) * phongPageSize, phongPage * phongPageSize).map(p => (
                  <div key={p.id} className="px-4 py-3 flex items-center justify-between group hover:bg-white/3 transition-colors">
                    <button onClick={() => setDetail(p)} className="text-left flex-1">
                      <p className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">{p.tenPhong}</p>
                      <p className="text-xs text-white/40 mt-0.5">ID: {p.id}</p>
                    </button>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => { e.stopPropagation(); openEditPhong(p); }} className="p-1.5 text-white/40 hover:text-white rounded hover:bg-white/5 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={e => { e.stopPropagation(); setDeletePhongId(p.id); }} className="p-1.5 text-white/40 hover:text-red-400 rounded hover:bg-red-400/5 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3">
                <Pagination page={phongPage} pageSize={phongPageSize} total={phongChieus.length} onChange={setPhongPage} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Rap Modal */}
      {rapModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-base font-bold text-white">{rapModal.mode === 'create' ? 'Thêm rạp mới' : 'Chỉnh sửa rạp'}</h2>
              <button onClick={() => setRapModal(null)} className="text-white/40 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSaveRap} className="p-6 space-y-4">
              {error && <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">{error}</p>}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Tên rạp *</label>
                <input value={rapForm.tenRap} onChange={e => setRapForm(p => ({...p, tenRap: e.target.value}))} className="input-field text-sm" placeholder="TTA Movie Hà Nội" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Địa chỉ</label>
                <input value={rapForm.diaChi} onChange={e => setRapForm(p => ({...p, diaChi: e.target.value}))} className="input-field text-sm" placeholder="123 Đường ABC, Quận 1" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Hotline</label>
                <input value={rapForm.hotline} onChange={e => setRapForm(p => ({...p, hotline: e.target.value}))} className="input-field text-sm" placeholder="0901234567" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setRapModal(null)} className="btn-outline text-sm px-5 py-2">Hủy</button>
                <button type="submit" disabled={saving} className="btn-primary text-sm px-5 py-2 disabled:opacity-60">
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PhongChieu Modal */}
      {phongModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-base font-bold text-white">{phongModal.mode === 'edit' ? 'Chỉnh sửa phòng chiếu' : 'Thêm phòng chiếu'}</h2>
              <button onClick={() => setPhongModal(null)} className="text-white/40 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSavePhong} className="p-6 space-y-4">
              {error && <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">{error}</p>}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Tên phòng *</label>
                <input value={phongForm.tenPhong} onChange={e => setPhongForm(p => ({...p, tenPhong: e.target.value}))} className="input-field text-sm" placeholder="Phòng 1, Phòng VIP..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Số hàng ghế</label>
                  <input type="number" value={phongForm.soHangGhe} onChange={e => setPhongForm(p => ({...p, soHangGhe: Number(e.target.value)}))} className="input-field text-sm" min={1} max={20} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Ghế mỗi hàng</label>
                  <input type="number" value={phongForm.soGheMotHang} onChange={e => setPhongForm(p => ({...p, soGheMotHang: Number(e.target.value)}))} className="input-field text-sm" min={1} max={30} />
                </div>
              </div>
              <p className="text-xs text-white/30">Tổng: {phongForm.soHangGhe * phongForm.soGheMotHang} ghế. Hàng cuối sẽ là VIP.</p>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setPhongModal(null)} className="btn-outline text-sm px-5 py-2">Hủy</button>
                <button type="submit" disabled={saving} className="btn-primary text-sm px-5 py-2 disabled:opacity-60">
                  {saving ? 'Đang lưu...' : phongModal.mode === 'edit' ? 'Lưu thay đổi' : 'Tạo phòng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm delete rap */}
      {deleteRapId && <ConfirmDelete onConfirm={handleDeleteRap} onCancel={() => setDeleteRapId(null)} label="rạp" />}
      {deletePhongId && (
        <ConfirmDelete
          onConfirm={handleDeletePhong}
          onCancel={() => { setDeletePhongId(null); setDeletePhongError('') }}
          label="phòng chiếu"
          error={deletePhongError}
        />
      )}

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-base font-bold text-white">Chi tiết phòng chiếu</h2>
              <button onClick={() => setDetail(null)} className="text-white/40 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Tên phòng chiếu</label>
                <p className="text-lg font-bold text-primary mt-1">{detail.tenPhong}</p>
              </div>
              {selectedRap && (
                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Rạp</label>
                  <p className="text-sm text-white mt-1">{selectedRap.tenRap}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 bg-white/5 rounded-lg p-4">
                <div>
                  <p className="text-xs font-semibold text-white/50 mb-1">SỐ HÀNG GHẾ</p>
                  <p className="text-lg font-bold text-white">{detail.soHangGhe}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/50 mb-1">SỐ GHẾ 1 HÀNG</p>
                  <p className="text-lg font-bold text-white">{detail.soGheMotHang}</p>
                </div>
              </div>
              <div className="text-sm text-white/60 text-center">
                <p>Tổng số ghế: <span className="text-primary font-semibold">{detail.soHangGhe * detail.soGheMotHang}</span></p>
              </div>
              <div className="flex justify-end">
                <button onClick={() => setDetail(null)} className="btn-outline text-sm py-2">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ConfirmDelete({ onConfirm, onCancel, label, error }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center">
        {error ? (
          <>
            <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-2">Không thể xóa</h3>
            <p className="text-sm text-yellow-400 mb-6">{error}</p>
            <button onClick={onCancel} className="w-full btn-primary text-sm py-2">Đóng</button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-2">Xóa {label}?</h3>
            <p className="text-sm text-white/40 mb-6">Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3">
              <button onClick={onCancel} className="flex-1 btn-outline text-sm py-2.5">Hủy</button>
              <button onClick={onConfirm} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">Xóa</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}


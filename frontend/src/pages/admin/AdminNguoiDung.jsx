import { useState, useEffect } from 'react'
import adminService from '../../services/adminService'
import Pagination from '../../components/Pagination'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—'

const EMPTY_EDIT = { hoTen: '', email: '', vaiTro: 'KhachHang' }

export default function AdminNguoiDung() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [deleteId, setDeleteId] = useState(null)
  const [deleteUser, setDeleteUser] = useState(null)

  // Modal sửa / xem chi tiết
  const [modal, setModal] = useState(null) // { mode: 'view'|'edit', user }
  const [editForm, setEditForm] = useState(EMPTY_EDIT)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const load = () => {
    setLoading(true)
    adminService.getAllNguoiDung()
      .then(res => setUsers(res.data?.data || res.data || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openView = (u) => {
    setModal({ mode: 'view', user: u })
    setEditForm({ hoTen: u.hoTen || '', email: u.email || '', vaiTro: u.vaiTro || 'KhachHang' })
    setEditError('')
  }

  const openEdit = (u) => {
    setModal({ mode: 'edit', user: u })
    setEditForm({ hoTen: u.hoTen || '', email: u.email || '', vaiTro: u.vaiTro || 'KhachHang' })
    setEditError('')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setEditError('')
    try {
      if (editForm.vaiTro !== modal.user.vaiTro) {
        await adminService.updateVaiTro(modal.user.id, editForm.vaiTro)
      }
      setUsers(prev => prev.map(u =>
        u.id === modal.user.id ? { ...u, vaiTro: editForm.vaiTro } : u
      ))
      setModal(null)
    } catch (err) {
      setEditError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await adminService.deleteNguoiDung(deleteId)
      setUsers(prev => prev.filter(u => u.id !== deleteId))
    } catch (e) { console.error(e) }
    setDeleteId(null); setDeleteUser(null)
  }

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.hoTen?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.soDienThoai?.includes(search)
    const matchRole = roleFilter === 'all' || u.vaiTro === roleFilter
    return matchSearch && matchRole
  })
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage(1)
  }, [search, roleFilter])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Người dùng</h1>
          <p className="text-sm text-white/40 mt-0.5">{users.length} tài khoản trong hệ thống</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email..."
            className="input-field text-sm pr-9 w-64"
          />
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="input-field text-sm w-auto"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="Admin">Admin</option>
          <option value="KhachHang">Khách hàng</option>
        </select>
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Người dùng</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden lg:table-cell">Số điện thoại</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Vai trò</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden lg:table-cell">Ngày tạo</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-white/30">Không có người dùng nào</td></tr>
              ) : pageItems.map(u => (
                <tr key={u.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                        {u.hoTen?.[0]?.toUpperCase() || '?'}
                      </div>
                      <p className="font-medium text-white">{u.hoTen}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/60 hidden md:table-cell">{u.email}</td>
                  <td className="px-4 py-3 text-white/60 hidden lg:table-cell">{u.soDienThoai || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      u.vaiTro === 'Admin' ? 'bg-primary/15 text-primary' : 'bg-white/5 text-white/50'
                    }`}>
                      {u.vaiTro === 'Admin' ? 'Admin' : 'Khách hàng'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs hidden lg:table-cell">{fmtDate(u.ngayTao)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Xem chi tiết */}
                      <button
                        onClick={() => openView(u)}
                        className="text-white/40 hover:text-blue-400 transition-colors p-1.5 rounded hover:bg-blue-400/5"
                        title="Xem chi tiết"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      {/* Sửa */}
                      <button
                        onClick={() => openEdit(u)}
                        className="text-white/40 hover:text-white transition-colors p-1.5 rounded hover:bg-white/5"
                        title="Chỉnh sửa"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {/* Xóa */}
                      <button
                        onClick={() => { setDeleteId(u.id); setDeleteUser(u) }}
                        className="text-white/40 hover:text-red-400 transition-colors p-1.5 rounded hover:bg-red-400/5"
                        title="Xóa"
                      >
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

      {/* Modal xem / sửa */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-base font-bold text-white">
                {modal.mode === 'view' ? 'Chi tiết người dùng' : 'Chỉnh sửa người dùng'}
              </h2>
              <button onClick={() => setModal(null)} className="text-white/40 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {modal.mode === 'view' ? (
              /* ---- XEM CHI TIẾT ---- */
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold shrink-0">
                    {modal.user.hoTen?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">{modal.user.hoTen}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      modal.user.vaiTro === 'Admin' ? 'bg-primary/15 text-primary' : 'bg-white/5 text-white/50'
                    }`}>
                      {modal.user.vaiTro === 'Admin' ? 'Admin' : 'Khách hàng'}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  <Row label="ID" value={`#${modal.user.id}`} />
                  <Row label="Email" value={modal.user.email} />
                  <Row label="Số điện thoại" value={modal.user.soDienThoai || '—'} />
                  <Row label="Ngày tạo" value={fmtDate(modal.user.ngayTao)} />
                  <Row label="Cập nhật" value={fmtDate(modal.user.ngayCapNhat)} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setModal(null)} className="btn-outline text-sm px-5 py-2">Đóng</button>
                  <button onClick={() => setModal({ ...modal, mode: 'edit' })} className="btn-primary text-sm px-5 py-2">Chỉnh sửa</button>
                </div>
              </div>
            ) : (
              /* ---- CHỈNH SỬA — hiển thị đầy đủ, chỉ sửa vai trò ---- */
              <form onSubmit={handleSave} className="p-6 space-y-4">
                {editError && (
                  <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">{editError}</p>
                )}

                {/* Avatar + tên */}
                <div className="flex items-center gap-4 pb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold shrink-0">
                    {modal.user.hoTen?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{modal.user.hoTen}</p>
                    <p className="text-xs text-white/40">#{modal.user.id}</p>
                  </div>
                </div>

                {/* Email — readonly */}
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Email</label>
                  <input
                    type="text"
                    value={modal.user.email}
                    disabled
                    className="input-field text-sm bg-white/5 opacity-75 cursor-not-allowed"
                  />
                </div>

                {/* Ngày tạo — readonly */}
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Ngày tạo</label>
                  <input
                    type="text"
                    value={fmtDate(modal.user.ngayTao)}
                    disabled
                    className="input-field text-sm bg-white/5 opacity-75 cursor-not-allowed"
                  />
                </div>

                {/* Cập nhật — readonly */}
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Cập nhật</label>
                  <input
                    type="text"
                    value={fmtDate(modal.user.ngayCapNhat)}
                    disabled
                    className="input-field text-sm bg-white/5 opacity-75 cursor-not-allowed"
                  />
                </div>

                {/* Vai trò — có thể sửa */}
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Vai trò</label>
                  <select
                    value={editForm.vaiTro}
                    onChange={e => setEditForm(p => ({ ...p, vaiTro: e.target.value }))}
                    className="input-field text-sm"
                  >
                    <option value="KhachHang">Khách hàng</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-1">
                  <button type="button" onClick={() => setModal(null)} className="btn-outline text-sm px-5 py-2">Hủy</button>
                  <button type="submit" disabled={saving} className="btn-primary text-sm px-5 py-2 disabled:opacity-60">
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-1">Xóa người dùng?</h3>
            {deleteUser && <p className="text-sm text-white/60 mb-1">{deleteUser.hoTen}</p>}
            <p className="text-sm text-white/40 mb-6">Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3">
              <button onClick={() => { setDeleteId(null); setDeleteUser(null) }} className="flex-1 btn-outline text-sm py-2.5">Hủy</button>
              <button onClick={handleDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">Xóa</button>
            </div>
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


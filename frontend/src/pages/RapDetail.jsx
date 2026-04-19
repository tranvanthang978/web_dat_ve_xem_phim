import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import rapService from '../services/rapService'
import Loading from '../components/Loading'

export default function RapDetail() {
  const { id } = useParams()
  const [rap, setRap] = useState(null)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const res = await rapService.getById(id)
        const data = res?.data || res
        setRap(data)

        const roomsRes = await rapService.getPhongChieuByRapId(id)
        const roomsData = roomsRes?.data || roomsRes
        setRooms(Array.isArray(roomsData) ? roomsData : [])
      } catch (err) {
        console.error('Lấy rạp thất bại', err)
        setRap(null)
        setRooms([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  if (loading) return <Loading fullScreen />
  if (!rap) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold">Rạp không tồn tại</h1>
          <Link to="/rap" className="btn-primary mt-4 inline-block">Quay lại</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="bg-dark-card border-b border-dark-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/rap" className="text-sm text-white/50 hover:text-white transition-colors">← Quay lại</Link>
          <h1 className="text-3xl font-black text-white mt-2">{rap.tenRap}</h1>
          <p className="text-white/40 mt-1">{rap.diaChi}</p>
          <p className="text-white/40 mt-1">Hotline: {rap.hotline || '---'}</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-white mb-4">Danh sách phòng chiếu</h2>
        {rooms.length === 0 ? (
          <p className="text-white/50">Chưa có phòng chiếu.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rooms.map(room => (
              <div key={room.id} className="bg-dark-card border border-dark-border rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-2">{room.tenPhong}</h3>
                <p className="text-sm text-white/60">Số ghế: {room.soGhe}</p>
                <p className="text-sm text-white/60">Số hàng: {room.soHangGhe}</p>
                <Link
                  to={`/phim`}
                  className="mt-3 inline-block btn-outline text-sm"
                >
                  Xem phim
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

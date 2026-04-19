import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import rapService from '../services/rapService'
import lichChieuService from '../services/lichChieuService'
import Loading from '../components/Loading'

export default function Rap() {
  const [raps, setRaps] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedRapId, setSelectedRapId] = useState(null)
  const [showTimes, setShowTimes] = useState([])
  const [showTimesLoading, setShowTimesLoading] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const res = await rapService.getAll()
        const data = res?.data || res
        const rapsData = Array.isArray(data) ? data : []
        setRaps(rapsData)
        // Tự động chọn rạp đầu tiên
        if (rapsData.length > 0) {
          setSelectedRapId(rapsData[0].id)
        }
      } catch (err) {
        console.error('Lấy rạp thất bại', err)
        setRaps([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  // Fetch lịch chiếu khi rạp được chọn thay đổi
  useEffect(() => {
    if (!selectedRapId) return

    const fetch = async () => {
      try {
        setShowTimesLoading(true)
        const res = await lichChieuService.getByRapId(selectedRapId)
        const data = res?.data || res
        setShowTimes(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Lấy lịch chiếu thất bại', err)
        setShowTimes([])
      } finally {
        setShowTimesLoading(false)
      }
    }
    fetch()
  }, [selectedRapId])

  const filtered = raps.filter(r =>
    r.tenRap.toLowerCase().includes(search.toLowerCase()) || r.diaChi.toLowerCase().includes(search.toLowerCase())
  )

  const selectedRap = raps.find(r => r.id === selectedRapId)

  return (
    <div className="min-h-screen">
      <div className="bg-dark-card border-b border-dark-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-black text-white">Rạp chiếu</h1>
          <p className="text-white/40 mt-1">Chọn rạp gần bạn và xem lịch chiếu mới nhất.</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ===== SIDEBAR: DANH SÁCH RẠP ===== */}
          <aside className="lg:w-72 shrink-0">
            <div className="mb-4">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm kiếm rạp..."
                className="input-field w-full"
              />
            </div>

            {loading ? (
              <Loading />
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                {filtered.map(rap => (
                  <button
                    key={rap.id}
                    onClick={() => setSelectedRapId(rap.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedRapId === rap.id
                        ? 'bg-primary/20 border-primary text-white'
                        : 'bg-dark-card border-dark-border text-white/80 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <h3 className="font-bold text-sm">{rap.tenRap}</h3>
                    <p className="text-xs text-white/50 mt-1 line-clamp-2">{rap.diaChi}</p>
                    <p className="text-xs text-white/40 mt-2">Hotline: {rap.hotline || '---'}</p>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center text-white/40 py-6">Không tìm thấy rạp</div>
                )}
              </div>
            )}
          </aside>

          {/* ===== MAIN: LỊCH CHIẾU ===== */}
          <div className="flex-1 min-w-0">
            {selectedRap ? (
              <div>
                <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedRap.tenRap}</h2>
                  <p className="text-sm text-white/60 mb-2">{selectedRap.diaChi}</p>
                  <p className="text-sm text-white/60">Hotline: {selectedRap.hotline || '---'}</p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Phim đang chiếu hôm nay</h3>

                  {showTimesLoading ? (
                    <Loading />
                  ) : showTimes.length === 0 ? (
                    <div className="text-center py-12 text-white/40">
                      <p>Chưa có lịch chiếu cho rạp này hôm nay</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Nhóm lịch chiếu theo phim */}
                      {Object.values(
                        showTimes.reduce((acc, show) => {
                          const phimId = show.phimId
                          if (!acc[phimId]) {
                            acc[phimId] = {
                              tenPhim: show.tenPhim,
                              shows: []
                            }
                          }
                          acc[phimId].shows.push(show)
                          return acc
                        }, {})
                      ).map((item, idx) => (
                        <div key={idx} className="bg-dark-card border border-dark-border rounded-xl overflow-hidden hover:border-white/20 transition-colors p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="text-white font-bold text-sm mb-3">
                                {item.tenPhim}
                              </h4>

                              {/* Showtime buttons */}
                              <div className="flex flex-wrap gap-2">
                                {item.shows.map((show) => {
                                  const timeString = new Date(show.gioBatDau).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                  return (
                                    <Link
                                      key={show.id}
                                      to={`/phim/${show.phimId || show.phim?.id}?scroll=showtimes`}
                                      className="bg-primary/20 hover:bg-primary text-white/80 hover:text-white border border-primary/40 text-xs font-semibold px-2.5 py-1 rounded transition-all"
                                    >
                                      {timeString}
                                    </Link>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-20 text-white/40">
                <p>Chọn một rạp để xem lịch chiếu</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'

const cinemas = [
  { id: 1, name: 'TTA Cinema Hà Nội', city: 'Hà Nội', address: '100 Trần Hưng Đạo, Hoàn Kiếm', rooms: 12, image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800' },
  { id: 2, name: 'TTA Cinema Sài Gòn', city: 'TP. HCM', address: '45 Nguyễn Huệ, Quận 1', rooms: 15, image: 'https://images.unsplash.com/photo-1489599849228-ed6fcf92290f?w=800' },
  { id: 3, name: 'TTA Cinema Đà Nẵng', city: 'Đà Nẵng', address: '23 Hùng Vương, Hải Châu', rooms: 8, image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800' },
  { id: 4, name: 'TTA Cinema Hải Phòng', city: 'Hải Phòng', address: '12 Điện Biên Phủ, Hồng Bàng', rooms: 10, image: 'https://images.unsplash.com/photo-1489599849228-ed6fcf92290f?w=800' },
]

const rooms = {
  1: [
    { id: 1, name: 'Phòng 1 - Standard', format: '2D', seats: 150, type: 'Standard' },
    { id: 2, name: 'Phòng 2 - IMAX', format: 'IMAX', seats: 200, type: 'Premium' },
    { id: 3, name: 'Phòng 3 - 4DX', format: '4DX', seats: 180, type: 'Premium' },
  ],
  2: [
    { id: 4, name: 'Phòng 1 - Standard', format: '2D', seats: 160, type: 'Standard' },
    { id: 5, name: 'Phòng 2 - Dolby', format: 'Dolby', seats: 190, type: 'Premium' },
  ],
  3: [
    { id: 6, name: 'Phòng 1 - Standard', format: '2D', seats: 140, type: 'Standard' },
  ],
  4: [
    { id: 7, name: 'Phòng 1 - Standard', format: '2D', seats: 150, type: 'Standard' },
    { id: 8, name: 'Phòng 2 - Premium', format: '2D', seats: 120, type: 'Premium' },
  ],
}

export default function Cinema() {
  const [selectedCity, setSelectedCity] = useState('Tất cả')
  const [selectedCinema, setSelectedCinema] = useState(null)
  const cities = ['Tất cả', ...new Set(cinemas.map(c => c.city))]

  const filtered = selectedCity === 'Tất cả'
    ? cinemas
    : cinemas.filter(c => c.city === selectedCity)

  const cinemaRooms = selectedCinema ? rooms[selectedCinema] : []

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-dark-card border-b border-dark-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-white/40 mb-3">
            <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">Rạp chiếu</span>
          </div>
          <h1 className="text-3xl font-black text-white">Danh sách rạp chiếu phim</h1>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* City Filter */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-white/50 uppercase tracking-widest mb-3">Chọn thành phố</label>
          <div className="flex flex-wrap gap-3">
            {cities.map(city => (
              <button
                key={city}
                onClick={() => { setSelectedCity(city); setSelectedCinema(null) }}
                className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
                  selectedCity === city
                    ? 'bg-primary text-white'
                    : 'bg-dark-card border border-dark-border text-white/60 hover:text-white hover:border-white/30'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cinema List */}
          <div className="lg:col-span-1 space-y-3">
            {filtered.map(cinema => (
              <button
                key={cinema.id}
                onClick={() => setSelectedCinema(cinema.id)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedCinema === cinema.id
                    ? 'bg-primary/15 border-primary text-white'
                    : 'bg-dark-card border-dark-border text-white/60 hover:text-white hover:border-white/30'
                }`}
              >
                <h3 className="font-bold mb-1">{cinema.name}</h3>
                <p className="text-xs text-white/50 mb-1">{cinema.address}</p>
                <p className="text-xs text-white/40">{cinema.rooms} phòng chiếu</p>
              </button>
            ))}
          </div>

          {/* Cinema Details */}
          <div className="lg:col-span-2">
            {selectedCinema ? (
              <>
                {(() => {
                  const cinema = cinemas.find(c => c.id === selectedCinema)
                  return (
                    <>
                      <div className="rounded-lg overflow-hidden mb-6">
                        <img
                          src={cinema.image}
                          alt={cinema.name}
                          className="w-full h-64 object-cover rounded-lg"
                          onError={(e) => { e.target.style.background = '#000' }}
                        />
                      </div>

                      <div className="bg-dark-card border border-dark-border rounded-lg p-6 mb-6">
                        <h2 className="text-2xl font-black text-white mb-4">{cinema.name}</h2>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-primary mt-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <div>
                              <p className="text-sm text-white/50">Địa chỉ</p>
                              <p className="text-white font-medium">{cinema.address}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-primary mt-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8 4m-8 4v-10" />
                            </svg>
                            <div>
                              <p className="text-sm text-white/50">Số phòng chiếu</p>
                              <p className="text-white font-medium">{cinema.rooms} phòng</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-white mb-4">Các phòng chiếu</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {cinemaRooms.map(room => (
                            <div key={room.id} className="bg-dark-card border border-dark-border rounded-lg p-4 hover:border-white/20 transition-colors">
                              <h4 className="font-bold text-white mb-2">{room.name}</h4>
                              <div className="space-y-1 text-xs text-white/60">
                                <p>Định dạng: <span className="text-primary">{room.format}</span></p>
                                <p>Ghế: {room.seats}</p>
                                <p>Loại: {room.type}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )
                })()}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <svg className="w-16 h-16 text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                <p className="text-lg text-white/40">Chọn một rạp để xem chi tiết</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

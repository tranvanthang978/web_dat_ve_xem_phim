export default function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize + 1
  const end = Math.min(total, page * pageSize)

  if (total <= pageSize) return null

  const pages = []
  const delta = 2
  const left = Math.max(1, page - delta)
  const right = Math.min(totalPages, page + delta)

  for (let i = left; i <= right; i += 1) {
    pages.push(i)
  }

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-white/50">Hiển thị {start}-{end} / {total} mục</p>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="h-9 px-3 rounded-lg border border-white/10 bg-[#111] text-white/50 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Trước
        </button>
        {pages[0] > 1 && (
          <button
            onClick={() => onChange(1)}
            className="h-9 w-9 rounded-lg border border-white/10 bg-[#111] text-white/50 hover:text-white transition-all"
          >
            1
          </button>
        )}
        {left > 2 && <span className="text-white/30">...</span>}
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`h-9 min-w-[2.25rem] rounded-lg border px-3 text-sm font-semibold transition-all ${p === page ? 'bg-red-600 text-white border-red-500' : 'border-white/10 bg-[#111] text-white/50 hover:text-white'}`}
          >
            {p}
          </button>
        ))}
        {right < totalPages - 1 && <span className="text-white/30">...</span>}
        {right < totalPages && (
          <button
            onClick={() => onChange(totalPages)}
            className="h-9 w-9 rounded-lg border border-white/10 bg-[#111] text-white/50 hover:text-white transition-all"
          >
            {totalPages}
          </button>
        )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="h-9 px-3 rounded-lg border border-white/10 bg-[#111] text-white/50 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Sau
        </button>
      </div>
    </div>
  )
}

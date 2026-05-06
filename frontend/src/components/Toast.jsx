export default function Toast({ type = 'ok', message }) {
  return (
    <div
      role="status"
      className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border ${
        type === 'ok'
          ? 'bg-green-500/10 text-green-400 border-green-500/20'
          : 'bg-red-500/10 text-red-400 border-red-500/20'
      }`}
    >
      {message}
    </div>
  )
}

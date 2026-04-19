export default function Loading({ fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark flex items-center justify-center z-50">
        <Spinner />
      </div>
    )
  }
  return (
    <div className="flex justify-center items-center py-16">
      <Spinner />
    </div>
  )
}

function Spinner() {
  return (
    <div className="w-10 h-10 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
  )
}

export function MiniDashboardPreview() {
  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-4 flex flex-col items-center gap-4 shadow-sm">

      {/* Macro Donut */}
      <svg viewBox="0 0 80 80" className="w-28 h-28">
        <circle cx="40" cy="40" r="28" fill="none" stroke="#e2e8f0" strokeWidth="12" />
        <circle cx="40" cy="40" r="28" fill="none" stroke="#10b981" strokeWidth="12"
          strokeDasharray="53 123" strokeDashoffset="0" strokeLinecap="butt" transform="rotate(-90 40 40)" />
        <circle cx="40" cy="40" r="28" fill="none" stroke="#3b82f6" strokeWidth="12"
          strokeDasharray="44 132" strokeDashoffset="-53" strokeLinecap="butt" transform="rotate(-90 40 40)" />
        <circle cx="40" cy="40" r="28" fill="none" stroke="#f59e0b" strokeWidth="12"
          strokeDasharray="26 150" strokeDashoffset="-97" strokeLinecap="butt" transform="rotate(-90 40 40)" />
      </svg>

      {/* NOVA Processing Gauge */}
      <div className="w-full px-2">
        {/* Triangle indicator */}
        <div className="relative h-4 mb-1">
          <div className="absolute" style={{ left: 'calc(72% - 7px)' }}>
            <svg width="14" height="10" viewBox="0 0 28 18">
              <polygon points="14,18 0,0 28,0" fill="#1e293b" />
            </svg>
          </div>
        </div>
        {/* Gradient bar with white marker */}
        <div className="relative h-4 rounded-full overflow-hidden" style={{ background: 'linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e)' }}>
          <div className="absolute top-0 bottom-0 w-1.5 bg-white/90" style={{ left: 'calc(72% - 3px)' }} />
        </div>
      </div>

    </div>
  )
}

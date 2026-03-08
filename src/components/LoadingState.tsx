import { useEffect, useState } from 'react'

const STEPS = [
  'Identifying foods...',
  'Looking up nutrition data...',
  'Calculating NOVA scores...',
  'Generating insights...',
]

export function LoadingState() {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex(i => Math.min(i + 1, STEPS.length - 1))
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      {/* spinner */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-white/10" />
        <div className="absolute inset-0 rounded-full border-4 border-green-400 border-t-transparent animate-spin" />
        <div className="absolute inset-3 rounded-full border-4 border-green-300/30 border-b-transparent animate-spin animation-delay-150" />
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-white font-semibold text-lg">{STEPS[stepIndex]}</p>
        <div className="flex gap-1.5 mt-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i <= stepIndex ? 'w-6 bg-green-400' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

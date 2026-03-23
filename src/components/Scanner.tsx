import { useRef, useEffect, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CapturedImage } from '../types'
import { compressImage } from '../utils/imageCompression'

interface ScannerProps {
  onCapture: (image: CapturedImage) => void
}

export function Scanner({ onCapture }: ScannerProps) {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [cameraError, setCameraError] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [showTip, setShowTip] = useState(() => {
    return localStorage.getItem('hideReferenceTip') !== 'true'
  })

  const dismissTip = () => {
    setShowTip(false)
    localStorage.setItem('hideReferenceTip', 'true')
  }

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => setCameraReady(true)
      }
    } catch {
      setCameraError(true)
    }
  }, [])

  useEffect(() => {
    // Initialize camera on mount - this is intentional sync state update
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startCamera()
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [startCamera])

  const capture = useCallback(async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    const raw = canvas.toDataURL('image/jpeg', 0.9)
    const dataUrl = await compressImage(raw)

    streamRef.current?.getTracks().forEach(t => t.stop())
    onCapture({ dataUrl })
  }, [onCapture])

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    const raw = await new Promise<string>((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        canvas.getContext('2d')?.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/jpeg', 0.9))
        URL.revokeObjectURL(objectUrl)
      }
      img.src = objectUrl
    })
    const dataUrl = await compressImage(raw)
    streamRef.current?.getTracks().forEach(t => t.stop())
    onCapture({ dataUrl })
  }, [onCapture])

  return (
    <div className="flex flex-col items-center gap-6">
      {/* NYU-Inspired Reference Object Tip */}
      {showTip && (
        <div className="w-full max-w-md px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1 text-sm text-blue-700">
            <strong className="font-semibold">{t('scan.proTip')}</strong> {t('scan.proTipMessage')}
          </div>
          <button
            onClick={dismissTip}
            className="text-blue-400 hover:text-blue-600 flex-shrink-0"
            aria-label="Dismiss tip"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="relative w-full max-w-md aspect-[4/3] bg-black rounded-2xl overflow-hidden shadow-2xl">
        {!cameraError ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* viewfinder overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-8 border-2 border-white/40 rounded-xl" />
              <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-xl" />
              <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-xl" />
              <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-xl" />
              <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-xl" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 px-6 text-center">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm">{t('scan.cameraUnavailable')}</p>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex flex-col items-center gap-3 w-full max-w-md">
        {!cameraError && (
          <button
            onClick={capture}
            disabled={!cameraReady}
            className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-400 active:scale-95 text-white font-semibold text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
          >
            {t('scan.scanMeal')}
          </button>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 active:scale-95 text-slate-600 font-medium transition-all"
        >
          {t('scan.uploadPhoto')}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  )
}

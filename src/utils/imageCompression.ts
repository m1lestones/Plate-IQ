/**
 * Compress an image data URL to a max dimension and JPEG quality.
 * Maintains aspect ratio. Sufficient for Claude Vision food identification.
 */
export function compressImage(
  dataUrl: string,
  maxDimension = 1024,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img
      const scale = Math.min(1, maxDimension / Math.max(w, h))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(w * scale)
      canvas.height = Math.round(h * scale)
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = reject
    img.src = dataUrl
  })
}

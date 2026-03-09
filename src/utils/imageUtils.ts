/**
 * Strips the data URL prefix from a base64 image string
 * Example: "data:image/jpeg;base64,/9j/4AAQ..." -> "/9j/4AAQ..."
 */
export function stripDataUrlPrefix(dataUrl: string): string {
  const base64Marker = ';base64,'
  const base64Index = dataUrl.indexOf(base64Marker)

  if (base64Index === -1) {
    // If no base64 marker, assume it's already stripped
    return dataUrl
  }

  return dataUrl.substring(base64Index + base64Marker.length)
}

/**
 * Extracts the media type from a data URL
 * Example: "data:image/jpeg;base64,..." -> "image/jpeg"
 * Defaults to "image/jpeg" if not found
 */
export function getMediaTypeFromDataUrl(dataUrl: string): string {
  const match = dataUrl.match(/^data:([^;]+);/)
  return match ? match[1] : 'image/jpeg'
}

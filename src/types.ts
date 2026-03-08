export type ScanStep = 'capture' | 'preview' | 'loading' | 'done'

export interface CapturedImage {
  dataUrl: string
  file?: File
}

import type { FileItem } from '../types'

// Tipo MIME customizado usado no drag & drop da sidebar para o canvas
export const DRAG_MIME = 'application/x-brainstormer-file'

export function serializeFileForDrag(file: FileItem): string {
  return JSON.stringify(file)
}

export function parseFileFromDrag(dataTransfer: DataTransfer): FileItem | null {
  const raw = dataTransfer.getData(DRAG_MIME)
  if (!raw) return null
  try {
    return JSON.parse(raw) as FileItem
  } catch {
    return null
  }
}

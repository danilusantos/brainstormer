import { Editor, createShapeId } from 'tldraw'
import type { FileItem } from '../types'
import type { ImageCardShape } from '../shapes/ImageCardShape'
import type { PdfCardShape } from '../shapes/PdfCardShape'

// Dimensões padrão dos cards
const IMAGE_CARD = { w: 320, h: 240 }
const PDF_CARD = { w: 360, h: 480 }

interface CreateCardOptions {
  // Posição em coordenadas de PÁGINA (não tela). Se omitida, usa o centro do viewport.
  x?: number
  y?: number
}

/**
 * Cria um card (imagem ou PDF) no editor a partir de um FileItem.
 * Se x/y forem fornecidos, o card é centralizado naquele ponto.
 * Caso contrário, é criado no centro do viewport atual.
 */
export function createCardForFile(
  editor: Editor,
  file: FileItem,
  options: CreateCardOptions = {}
): void {
  if (file.type === 'pdf') {
    createPdfCard(editor, file, options)
  } else {
    createImageCard(editor, file, options)
  }
}

function resolvePosition(
  editor: Editor,
  options: CreateCardOptions,
  w: number,
  h: number
): { x: number; y: number } {
  if (options.x !== undefined && options.y !== undefined) {
    // Centraliza o card no ponto informado
    return { x: options.x - w / 2, y: options.y - h / 2 }
  }
  // Centro do viewport atual
  const viewport = editor.getViewportPageBounds()
  return {
    x: viewport.x + viewport.w / 2 - w / 2,
    y: viewport.y + viewport.h / 2 - h / 2,
  }
}

export function createImageCard(
  editor: Editor,
  file: FileItem,
  options: CreateCardOptions = {}
): void {
  const { x, y } = resolvePosition(editor, options, IMAGE_CARD.w, IMAGE_CARD.h)

  editor.createShape<ImageCardShape>({
    id: createShapeId(),
    type: 'image-card',
    x,
    y,
    props: {
      w: IMAGE_CARD.w,
      h: IMAGE_CARD.h,
      url: file.url,
      label: file.displayName,
    },
  })
}

export function createPdfCard(
  editor: Editor,
  file: FileItem,
  options: CreateCardOptions = {}
): void {
  const { x, y } = resolvePosition(editor, options, PDF_CARD.w, PDF_CARD.h)

  editor.createShape<PdfCardShape>({
    id: createShapeId(),
    type: 'pdf-card',
    x,
    y,
    props: {
      w: PDF_CARD.w,
      h: PDF_CARD.h,
      url: file.url,
      label: file.displayName,
    },
  })
}

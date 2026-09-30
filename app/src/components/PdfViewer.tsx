import { useEffect, useRef, useState, useCallback } from 'react'
import { getDocument } from 'pdfjs-dist'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import { ChevronLeft, ChevronRight, Loader2, FileWarning } from 'lucide-react'

interface PdfViewerProps {
  url: string
  width: number
  height: number
}

const CONTROLS_HEIGHT = 34

export function PdfViewer({ url, width, height }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const renderTaskRef = useRef<RenderTask | null>(null)

  // ── Carregar o PDF ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    let loadedDoc: PDFDocumentProxy | null = null

    setLoading(true)
    setError(null)
    setPdf(null)

    const loadingTask = getDocument(url)
    loadingTask.promise
      .then(doc => {
        if (cancelled) {
          // Componente já desmontou: destrói o doc que acabou de carregar
          doc.destroy()
          return
        }
        loadedDoc = doc
        setPdf(doc)
        setTotalPages(doc.numPages)
        setCurrentPage(1)
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        console.error('Erro ao carregar PDF:', err)
        setError('Não foi possível abrir o PDF')
        setLoading(false)
      })

    return () => {
      cancelled = true
      // Cancela renderização em andamento
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
        renderTaskRef.current = null
      }
      // Destrói o doc já carregado (se houver). Não chamamos destroy no
      // loadingTask enquanto ele ainda resolve — isso causava erros.
      if (loadedDoc) {
        loadedDoc.destroy()
      }
    }
  }, [url])

  // ── Renderizar página ─────────────────────────────────────────
  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdf || !canvasRef.current) return

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel()
      renderTaskRef.current = null
    }

    try {
      const page = await pdf.getPage(pageNum)
      const canvas = canvasRef.current
      if (!canvas) return

      const availW = Math.max(width - 4, 1)
      const availH = Math.max(height - CONTROLS_HEIGHT - 4, 1)

      const base = page.getViewport({ scale: 1 })
      const scale = Math.min(availW / base.width, availH / base.height, 3)
      const viewport = page.getViewport({ scale })

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = viewport.width
      canvas.height = viewport.height

      const task = page.render({ canvasContext: ctx, viewport })
      renderTaskRef.current = task
      await task.promise
      renderTaskRef.current = null
    } catch (err: unknown) {
      // RenderingCancelledException é esperado ao trocar de página rápido
      const name = (err as { name?: string })?.name
      if (name === 'RenderingCancelledException') return
      if (err instanceof Error && err.message?.toLowerCase().includes('cancel')) return
      console.error('Erro ao renderizar página:', err)
    }
  }, [pdf, width, height])

  useEffect(() => {
    if (pdf) renderPage(currentPage)
  }, [pdf, currentPage, renderPage])

  const goToPrev = (e: React.PointerEvent) => {
    e.stopPropagation()
    setCurrentPage(p => Math.max(1, p - 1))
  }

  const goToNext = (e: React.PointerEvent) => {
    e.stopPropagation()
    setCurrentPage(p => Math.min(totalPages, p + 1))
  }

  // ── Estados de loading / erro ─────────────────────────────────
  if (loading) {
    return (
      <div
        className="flex items-center justify-center gap-2 bg-surface text-ink-muted"
        style={{ width, height }}
      >
        <Loader2 size={16} className="animate-spin" />
        <span className="text-xs">Carregando PDF</span>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 bg-surface p-4 text-center text-danger"
        style={{ width, height }}
      >
        <FileWarning size={22} />
        <span className="text-xs">{error}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-surface" style={{ width, height }}>
      {/* Canvas da página */}
      <div className="flex flex-1 items-center justify-center overflow-hidden bg-[#f4f4f5]">
        <canvas ref={canvasRef} className="max-h-full max-w-full object-contain" />
      </div>

      {/* Controles de navegação */}
      <div
        className="flex flex-shrink-0 items-center justify-between border-t border-subtle bg-surface px-2"
        style={{ height: CONTROLS_HEIGHT }}
      >
        <button
          onPointerDown={goToPrev}
          disabled={currentPage <= 1}
          className="flex h-6 w-6 items-center justify-center rounded text-ink-secondary transition-colors hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-30"
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="text-[11px] font-medium text-ink-secondary">
          {currentPage} / {totalPages}
        </span>

        <button
          onPointerDown={goToNext}
          disabled={currentPage >= totalPages}
          className="flex h-6 w-6 items-center justify-center rounded text-ink-secondary transition-colors hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-30"
          aria-label="Próxima página"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

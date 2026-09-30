import { useEffect, useRef, useState, useCallback } from 'react'
import { getDocument } from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'

interface PdfViewerProps {
  url: string
  width: number
  height: number
}

export function PdfViewer({ url, width, height }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null)

  // Carregar o PDF
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const loadingTask = getDocument(url)
    loadingTask.promise
      .then(doc => {
        if (cancelled) return
        setPdf(doc)
        setTotalPages(doc.numPages)
        setCurrentPage(1)
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        console.error('Erro ao carregar PDF:', err)
        setError('Falha ao carregar PDF')
        setLoading(false)
      })

    return () => {
      cancelled = true
      loadingTask.destroy()
    }
  }, [url])

  // Renderizar página
  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdf || !canvasRef.current) return

    // Cancelar renderização anterior
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel()
      renderTaskRef.current = null
    }

    try {
      const page = await pdf.getPage(pageNum)
      const canvas = canvasRef.current
      if (!canvas) return

      // Calcular escala para caber no card
      const containerWidth = width - 2 // margem
      const containerHeight = height - 44 // espaço para controles

      const viewport0 = page.getViewport({ scale: 1 })
      const scaleX = containerWidth / viewport0.width
      const scaleY = containerHeight / viewport0.height
      const scale = Math.min(scaleX, scaleY, 2)

      const viewport = page.getViewport({ scale })
      const ctx = canvas.getContext('2d')!

      canvas.width = viewport.width
      canvas.height = viewport.height

      const renderTask = page.render({ canvasContext: ctx, viewport })
      renderTaskRef.current = renderTask

      await renderTask.promise
      page.cleanup()
    } catch (err: unknown) {
      // Ignorar erros de cancelamento
      if (err instanceof Error && err.message?.includes('cancelled')) return
      console.error('Erro ao renderizar página:', err)
    }
  }, [pdf, width, height])

  useEffect(() => {
    if (pdf) renderPage(currentPage)
  }, [pdf, currentPage, renderPage])

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentPage(p => Math.max(1, p - 1))
  }

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentPage(p => Math.min(totalPages, p + 1))
  }

  if (loading) {
    return (
      <div style={{
        width, height,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#1a1a2e', color: '#8892a4', fontSize: 13, borderRadius: 8,
      }}>
        <span>Carregando PDF...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        width, height,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#1a1a2e', color: '#e94560', fontSize: 13, borderRadius: 8,
        padding: 16, textAlign: 'center',
      }}>
        <span>⚠️ {error}</span>
      </div>
    )
  }

  return (
    <div style={{
      width, height,
      display: 'flex', flexDirection: 'column',
      background: '#1a1a2e', borderRadius: 8, overflow: 'hidden',
    }}>
      {/* Canvas da página */}
      <div style={{
        flex: 1, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0d0d1a',
      }}>
        <canvas
          ref={canvasRef}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      </div>

      {/* Controles de navegação */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 10px',
        background: 'rgba(0,0,0,0.6)',
        flexShrink: 0,
        height: 36,
      }}>
        <button
          onPointerDown={goToPrev}
          disabled={currentPage <= 1}
          style={navButtonStyle(currentPage <= 1)}
        >
          ◀
        </button>

        <span style={{ color: '#eaeaea', fontSize: 11 }}>
          {currentPage} / {totalPages}
        </span>

        <button
          onPointerDown={goToNext}
          disabled={currentPage >= totalPages}
          style={navButtonStyle(currentPage >= totalPages)}
        >
          ▶
        </button>
      </div>
    </div>
  )
}

function navButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    background: disabled ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.15)',
    border: 'none',
    color: disabled ? '#444' : '#eaeaea',
    cursor: disabled ? 'default' : 'pointer',
    borderRadius: 4,
    padding: '2px 10px',
    fontSize: 12,
    transition: 'background 0.15s',
    pointerEvents: disabled ? 'none' : 'all',
  }
}

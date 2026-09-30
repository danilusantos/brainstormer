import { useEffect, useState } from 'react'
import { useEditor } from 'tldraw'
import { MousePointerClick } from 'lucide-react'
import { createCardForFile } from '../lib/createCard'
import { parseFileFromDrag, DRAG_MIME } from '../lib/dragData'

/**
 * Componente invisível que registra handlers de drag & drop no container do canvas.
 * Precisa estar dentro do <Tldraw> para acessar o editor via useEditor().
 */
export function CanvasDropZone() {
  const editor = useEditor()
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  useEffect(() => {
    const container = editor.getContainer()
    if (!container) return

    function hasBrainstormerFile(e: DragEvent): boolean {
      return Array.from(e.dataTransfer?.types ?? []).includes(DRAG_MIME)
    }

    function handleDragOver(e: DragEvent) {
      if (!hasBrainstormerFile(e)) return
      e.preventDefault()
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
      setIsDraggingOver(true)
    }

    function handleDragLeave(e: DragEvent) {
      // Só desativa se saiu realmente do container (não de um filho)
      if (e.relatedTarget && container.contains(e.relatedTarget as Node)) return
      setIsDraggingOver(false)
    }

    function handleDrop(e: DragEvent) {
      if (!e.dataTransfer) return
      const file = parseFileFromDrag(e.dataTransfer)
      if (!file) return // não é um arquivo nosso: ignora

      // Impede o tldraw de também processar este drop (evita duplicação)
      e.preventDefault()
      e.stopPropagation()
      setIsDraggingOver(false)

      // Converte a posição da tela (mouse) para coordenadas de página do tldraw
      const pagePoint = editor.screenToPage({ x: e.clientX, y: e.clientY })
      createCardForFile(editor, file, { x: pagePoint.x, y: pagePoint.y })
    }

    // capture: true garante que rodamos antes do handler do tldraw
    container.addEventListener('dragover', handleDragOver, { capture: true })
    container.addEventListener('dragleave', handleDragLeave, { capture: true })
    container.addEventListener('drop', handleDrop, { capture: true })

    return () => {
      container.removeEventListener('dragover', handleDragOver, { capture: true })
      container.removeEventListener('dragleave', handleDragLeave, { capture: true })
      container.removeEventListener('drop', handleDrop, { capture: true })
    }
  }, [editor])

  if (!isDraggingOver) return null

  // Overlay de feedback visual durante o arraste
  return (
    <div className="pointer-events-none absolute inset-0 z-[300] flex items-center justify-center border-[3px] border-dashed border-brand bg-brand/5">
      <div className="flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-float">
        <MousePointerClick size={18} />
        Solte aqui para adicionar ao quadro
      </div>
    </div>
  )
}

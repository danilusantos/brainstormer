import { useEffect, useRef, useState } from 'react'
import { useEditor } from 'tldraw'
import { Clipboard } from 'lucide-react'
import { createCardForFile } from '../lib/createCard'
import type { FileItem } from '../types'

/**
 * Escuta Ctrl+V globalmente. Quando há uma imagem no clipboard:
 * 1. Converte para dataURL
 * 2. Envia para POST /api/upload (salva o arquivo em assets/files/)
 * 3. Cria um card no centro do viewport com o arquivo retornado
 *
 * Usa captura (capture: true) + stopPropagation para interceptar o evento
 * ANTES do handler nativo do tldraw, evitando duplicação.
 * O guard `isPasting` evita disparo duplo (StrictMode / eventos repetidos).
 */
export function PasteHandler() {
  const editor = useEditor()
  const [toast, setToast] = useState<string | null>(null)
  const isPastingRef = useRef(false)

  useEffect(() => {
    function showToast(msg: string, duration = 2500) {
      setToast(msg)
      window.setTimeout(() => setToast(null), duration)
    }

    async function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items
      if (!items) return

      // Procura o primeiro item de imagem
      let imageFile: File | null = null
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          imageFile = item.getAsFile()
          break
        }
      }

      if (!imageFile) return // sem imagem: deixa o comportamento padrão (colar texto)

      // Impede o tldraw (e qualquer outro listener) de também processar
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()

      // Guard anti-duplicação
      if (isPastingRef.current) return
      isPastingRef.current = true

      showToast('Enviando imagem colada...')

      try {
        const dataUrl = await fileToDataUrl(imageFile)

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || `HTTP ${res.status}`)
        }

        const { file } = (await res.json()) as { file: FileItem }
        if (!file) throw new Error('Resposta sem arquivo')

        createCardForFile(editor, file)
        showToast('Imagem adicionada ao quadro')
      } catch (err) {
        console.error('Erro ao colar imagem:', err)
        showToast('Falha ao colar imagem')
      } finally {
        // Libera o guard após um pequeno intervalo
        window.setTimeout(() => { isPastingRef.current = false }, 300)
      }
    }

    // capture: true garante que rodamos antes do handler do tldraw
    window.addEventListener('paste', handlePaste, { capture: true })
    return () => window.removeEventListener('paste', handlePaste, { capture: true })
  }, [editor])

  if (!toast) return null

  return (
    <div className="pointer-events-none absolute bottom-5 left-1/2 z-[600] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-lg bg-ink px-4 py-2 text-xs font-medium text-white shadow-float">
      <Clipboard size={14} />
      {toast}
    </div>
  )
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

import { useEffect, useRef, useState } from 'react'
import { useEditor, getSnapshot, loadSnapshot } from 'tldraw'
import { Loader2, Check, AlertTriangle } from 'lucide-react'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const AUTOSAVE_DEBOUNCE_MS = 1500

interface BoardPayload {
  version: number
  timestamp: number
  snapshot: ReturnType<typeof getSnapshot>
}

/**
 * Auto-save do quadro:
 * 1. Ao montar, carrega o último quadro salvo do servidor (GET /api/board)
 * 2. Escuta mudanças no store do tldraw e salva (POST /api/board) com debounce
 * 3. Mostra indicador de status "salvando / salvo" na toolbar
 */
export function AutoSave() {
  const editor = useEditor()
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [loaded, setLoaded] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedAtRef = useRef<number>(0)

  // ── 1. Carregar o último quadro salvo ao abrir ────────────────
  useEffect(() => {
    let cancelled = false

    async function loadLastBoard() {
      try {
        const res = await fetch('/api/board')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const { board } = (await res.json()) as { board: BoardPayload | null }

        if (!cancelled && board && board.snapshot) {
          loadSnapshot(editor.store, board.snapshot)
          console.log('Quadro anterior restaurado do servidor')
        }
      } catch (err) {
        console.warn('Nao foi possivel carregar o quadro anterior:', err)
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }

    loadLastBoard()
    return () => { cancelled = true }
  }, [editor])

  // ── 2. Salvar com debounce ao detectar mudanças ───────────────
  useEffect(() => {
    // Só começa a monitorar depois de carregar o estado inicial,
    // para não sobrescrever com um quadro vazio antes do load.
    if (!loaded) return

    async function saveBoard() {
      setStatus('saving')
      try {
        const snapshot = getSnapshot(editor.store)
        const payload: BoardPayload = {
          version: 1,
          timestamp: Date.now(),
          snapshot,
        }

        const res = await fetch('/api/board', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        lastSavedAtRef.current = Date.now()
        setStatus('saved')
      } catch (err) {
        console.error('Erro no auto-save:', err)
        setStatus('error')
      }
    }

    // Escuta qualquer mudança no documento (shapes, posições, etc.)
    const unsubscribe = editor.store.listen(
      () => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        setStatus('saving')
        debounceRef.current = setTimeout(saveBoard, AUTOSAVE_DEBOUNCE_MS)
      },
      { source: 'user', scope: 'document' }
    )

    return () => {
      unsubscribe()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [editor, loaded])

  return <SaveIndicator status={status} />
}

// ── Indicador visual de status ─────────────────────────────────

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null

  const config: Record<Exclude<SaveStatus, 'idle'>, { label: string; className: string; icon: React.ReactNode }> = {
    saving: {
      label: 'Salvando',
      className: 'text-warn',
      icon: <Loader2 size={13} className="animate-spin" />,
    },
    saved: {
      label: 'Salvo',
      className: 'text-ok',
      icon: <Check size={13} />,
    },
    error: {
      label: 'Erro ao salvar',
      className: 'text-danger',
      icon: <AlertTriangle size={13} />,
    },
  }

  const { label, className, icon } = config[status]

  return (
    <div className="pointer-events-none absolute right-4 top-3.5 z-[500] flex items-center gap-1.5 rounded-full border border-subtle bg-surface/95 px-3 py-1.5 text-[11px] font-medium text-ink-secondary shadow-card backdrop-blur">
      <span className={className}>{icon}</span>
      <span>{label}</span>
    </div>
  )
}

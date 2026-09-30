import { useEditor, getSnapshot, loadSnapshot } from 'tldraw'
import { useRef } from 'react'
import { Download, Upload } from 'lucide-react'
import { IconButton } from '../ui/IconButton'

interface BrainstormSnapshot {
  version: number
  timestamp: number
  snapshot: ReturnType<typeof getSnapshot>
}

export function Toolbar() {
  const editor = useEditor()
  const importInputRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    const snapshot = getSnapshot(editor.store)
    const data: BrainstormSnapshot = {
      version: 1,
      timestamp: Date.now(),
      snapshot,
    }

    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const date = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')
    const a = document.createElement('a')
    a.href = url
    a.download = `brainstorm-${date}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportClick() {
    importInputRef.current?.click()
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data.snapshot) {
        alert('Arquivo inválido: não é um arquivo de estado do Brainstormer.')
        return
      }

      loadSnapshot(editor.store, data.snapshot)
    } catch (err) {
      console.error('Erro ao importar:', err)
      alert('Erro ao importar o arquivo. Verifique se é um JSON válido do Brainstormer.')
    } finally {
      if (importInputRef.current) importInputRef.current.value = ''
    }
  }

  return (
    <div
      className="pointer-events-auto absolute left-1/2 top-3 z-[500] flex -translate-x-1/2 items-center gap-1 rounded-xl border border-subtle bg-surface/95 p-1 shadow-card backdrop-blur"
    >
      <input
        ref={importInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImportFile}
      />

      <IconButton icon={Download} label="Exportar quadro" onClick={handleExport} />
      <IconButton icon={Upload} label="Importar quadro" onClick={handleImportClick} />
    </div>
  )
}

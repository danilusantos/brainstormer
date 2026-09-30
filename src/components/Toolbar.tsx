import { useEditor, getSnapshot, loadSnapshot } from 'tldraw'
import { useRef } from 'react'

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
      alert('Quadro restaurado com sucesso!')
    } catch (err) {
      console.error('Erro ao importar:', err)
      alert('Erro ao importar o arquivo. Verifique se é um JSON válido do Brainstormer.')
    } finally {
      // Reset input para permitir importar o mesmo arquivo novamente
      if (importInputRef.current) importInputRef.current.value = ''
    }
  }

  return (
    <div style={{
      position: 'absolute',
      top: 12,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 500,
      display: 'flex',
      gap: 8,
      pointerEvents: 'all',
    }}>
      <input
        ref={importInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleImportFile}
      />

      <ToolbarButton
        icon="💾"
        label="Exportar"
        title="Exportar quadro como JSON"
        onClick={handleExport}
        color="#4caf50"
      />

      <ToolbarButton
        icon="📂"
        label="Importar"
        title="Importar quadro de um arquivo JSON"
        onClick={handleImportClick}
        color="#2196f3"
      />
    </div>
  )
}

interface ToolbarButtonProps {
  icon: string
  label: string
  title: string
  onClick: () => void
  color: string
}

function ToolbarButton({ icon, label, title, onClick, color }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 14px',
        background: 'rgba(22, 33, 62, 0.92)',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${color}44`,
        borderRadius: 20,
        color: '#eaeaea',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
        letterSpacing: 0.3,
      }}
      onMouseEnter={e => {
        const btn = e.currentTarget as HTMLButtonElement
        btn.style.background = color + '22'
        btn.style.borderColor = color
        btn.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        const btn = e.currentTarget as HTMLButtonElement
        btn.style.background = 'rgba(22, 33, 62, 0.92)'
        btn.style.borderColor = color + '44'
        btn.style.transform = 'translateY(0)'
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

import { useState, useMemo } from 'react'
import { useEditor } from 'tldraw'
import { Search, X, FileText, Image as ImageIcon, FolderOpen, Brain, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import type { FileItem, SSEStatus } from '../types'
import { createCardForFile } from '../lib/createCard'
import { DRAG_MIME, serializeFileForDrag } from '../lib/dragData'
import { Tooltip } from '../ui/Tooltip'

interface SidebarProps {
  files: FileItem[]
  status: SSEStatus
  collapsed: boolean
  onToggle: () => void
}

type TypeFilter = 'all' | 'image' | 'pdf'

export function Sidebar({ files, status, collapsed, onToggle }: SidebarProps) {
  const editor = useEditor()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return files.filter(f => {
      if (typeFilter !== 'all' && f.type !== typeFilter) return false
      if (!term) return true
      return (
        f.displayName.toLowerCase().includes(term) ||
        f.folder.toLowerCase().includes(term)
      )
    })
  }, [files, search, typeFilter])

  const images = filtered.filter(f => f.type === 'image')
  const pdfs = filtered.filter(f => f.type === 'pdf')

  function handleAdd(file: FileItem) {
    createCardForFile(editor, file)
  }

  const statusMap: Record<SSEStatus, { color: string; label: string }> = {
    connecting: { color: 'bg-warn', label: 'Conectando' },
    connected: { color: 'bg-ok', label: 'Ao vivo' },
    disconnected: { color: 'bg-danger', label: 'Desconectado' },
  }

  const hasFiles = files.length > 0
  const hasResults = filtered.length > 0

  // ── Modo recolhido: barra fina só com o botão de expandir ─────
  if (collapsed) {
    return (
      <div className="flex h-full w-12 flex-col items-center gap-3 border-r border-subtle bg-surface py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft">
          <Brain size={16} className="text-brand" strokeWidth={2.2} />
        </div>
        <Tooltip label="Mostrar acervo" side="right">
          <button
            onClick={onToggle}
            aria-label="Mostrar acervo"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
          >
            <PanelLeftOpen size={18} />
          </button>
        </Tooltip>
      </div>
    )
  }

  return (
    <div
      className="flex h-full flex-col overflow-hidden border-r border-subtle bg-surface"
      style={{ width: 'var(--sidebar-width)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-subtle px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft">
            <Brain size={16} className="text-brand" strokeWidth={2.2} />
          </div>
          <h1 className="text-sm font-semibold tracking-tight text-ink">Brainstormer</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center" title={statusMap[status].label}>
            <span className={`h-1.5 w-1.5 rounded-full ${statusMap[status].color}`} />
          </div>
          <Tooltip label="Ocultar acervo" side="bottom">
            <button
              onClick={onToggle}
              aria-label="Ocultar acervo"
              className="flex h-7 w-7 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
            >
              <PanelLeftClose size={16} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Busca + Filtro */}
      {hasFiles && (
        <div className="flex flex-col gap-2 border-b border-subtle px-3 py-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar arquivo ou pasta"
              className="w-full rounded-lg border border-subtle bg-bg py-1.5 pl-8 pr-7 text-xs text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-brand"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex gap-1">
            <FilterTab label="Todos" active={typeFilter === 'all'} onClick={() => setTypeFilter('all')} />
            <FilterTab label="Imagens" active={typeFilter === 'image'} onClick={() => setTypeFilter('image')} />
            <FilterTab label="PDFs" active={typeFilter === 'pdf'} onClick={() => setTypeFilter('pdf')} />
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="flex-1 overflow-y-auto py-2">
        {!hasFiles ? (
          <EmptyState
            icon={<FolderOpen size={28} className="text-ink-muted" />}
            text={<>Nenhum arquivo ainda. Coloque imagens ou PDFs na pasta <strong className="text-ink">files/</strong>, ou cole com <strong className="text-ink">Ctrl+V</strong>.</>}
          />
        ) : !hasResults ? (
          <EmptyState
            icon={<Search size={26} className="text-ink-muted" />}
            text={<>Nenhum resultado para "<strong className="text-ink">{search}</strong>".</>}
          />
        ) : (
          <>
            {images.length > 0 && (typeFilter === 'all' || typeFilter === 'image') && (
              <FileGroup title="Imagens" count={images.length} files={images} onAdd={handleAdd} type="image" />
            )}
            {pdfs.length > 0 && (typeFilter === 'all' || typeFilter === 'pdf') && (
              <FileGroup title="PDFs" count={pdfs.length} files={pdfs} onAdd={handleAdd} type="pdf" />
            )}
          </>
        )}
      </div>

      {/* Rodapé */}
      {hasFiles && (
        <div className="border-t border-subtle px-4 py-2 text-[11px] text-ink-muted">
          {filtered.length} de {files.length} arquivo(s)
        </div>
      )}
    </div>
  )
}

// ── EmptyState ─────────────────────────────────────────────────

function EmptyState({ icon, text }: { icon: React.ReactNode; text: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      {icon}
      <p className="text-xs leading-relaxed text-ink-secondary">{text}</p>
    </div>
  )
}

// ── FilterTab ──────────────────────────────────────────────────

function FilterTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
        active
          ? 'bg-brand text-white'
          : 'bg-bg text-ink-secondary hover:bg-surface-hover'
      }`}
    >
      {label}
    </button>
  )
}

// ── FileGroup ──────────────────────────────────────────────────

interface FileGroupProps {
  title: string
  count: number
  files: FileItem[]
  onAdd: (file: FileItem) => void
  type: 'image' | 'pdf'
}

function FileGroup({ title, count, files, onAdd, type }: FileGroupProps) {
  return (
    <div className="mb-1">
      <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
        {title} · {count}
      </div>
      {files.map(file => (
        <FileRow key={file.name} file={file} onAdd={onAdd} type={type} />
      ))}
    </div>
  )
}

// ── FileRow ────────────────────────────────────────────────────

interface FileRowProps {
  file: FileItem
  onAdd: (file: FileItem) => void
  type: 'image' | 'pdf'
}

function FileRow({ file, onAdd, type }: FileRowProps) {
  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData(DRAG_MIME, serializeFileForDrag(file))
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <button
      draggable
      onDragStart={handleDragStart}
      onClick={() => onAdd(file)}
      title={`Clique ou arraste "${file.displayName}" para o quadro`}
      className="group flex w-full cursor-grab items-center gap-2.5 px-3 py-1.5 text-left transition-colors hover:bg-surface-hover active:cursor-grabbing"
    >
      {/* Thumbnail */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-subtle bg-bg">
        {type === 'image' ? (
          <img
            src={file.url}
            alt={file.displayName}
            draggable={false}
            className="h-full w-full object-cover"
            onError={e => {
              const img = e.currentTarget
              img.style.display = 'none'
              const parent = img.parentElement
              if (parent && !parent.querySelector('.fallback-icon')) {
                const span = document.createElement('span')
                span.className = 'fallback-icon flex items-center justify-center text-ink-muted'
                span.innerHTML = ''
                parent.appendChild(span)
              }
            }}
          />
        ) : (
          <FileText size={18} className="text-danger" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium text-ink">{file.displayName}</div>
        <div className="mt-0.5 flex items-center gap-1.5 truncate text-[10px] text-ink-muted">
          {file.folder && (
            <span className="flex items-center gap-1 truncate text-brand" title={file.folder}>
              <FolderOpen size={10} />
              {file.folder}
            </span>
          )}
          <span className="flex-shrink-0">{formatSize(file.size)}</span>
        </div>
      </div>

      {/* Ícone do tipo */}
      <span className="flex-shrink-0 text-ink-muted opacity-0 transition-opacity group-hover:opacity-100">
        {type === 'image' ? <ImageIcon size={14} /> : <FileText size={14} />}
      </span>
    </button>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

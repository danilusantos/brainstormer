import { useEditor, createShapeId } from 'tldraw'
import type { FileItem, SSEStatus } from '../types'
import type { ImageCardShape } from '../shapes/ImageCardShape'
import type { PdfCardShape } from '../shapes/PdfCardShape'

interface SidebarProps {
  files: FileItem[]
  status: SSEStatus
}

export function Sidebar({ files, status }: SidebarProps) {
  const editor = useEditor()

  const images = files.filter(f => f.type === 'image')
  const pdfs = files.filter(f => f.type === 'pdf')

  function addImageCard(file: FileItem) {
    const viewport = editor.getViewportPageBounds()
    const cx = viewport.x + viewport.w / 2 - 160
    const cy = viewport.y + viewport.h / 2 - 120

    editor.createShape<ImageCardShape>({
      id: createShapeId(),
      type: 'image-card',
      x: cx,
      y: cy,
      props: {
        w: 320,
        h: 240,
        url: file.url,
        label: file.displayName,
      },
    })
  }

  function addPdfCard(file: FileItem) {
    const viewport = editor.getViewportPageBounds()
    const cx = viewport.x + viewport.w / 2 - 180
    const cy = viewport.y + viewport.h / 2 - 240

    editor.createShape<PdfCardShape>({
      id: createShapeId(),
      type: 'pdf-card',
      x: cx,
      y: cy,
      props: {
        w: 360,
        h: 480,
        url: file.url,
        label: file.displayName,
      },
    })
  }

  const statusColors: Record<SSEStatus, string> = {
    connecting: '#ff9800',
    connected: '#4caf50',
    disconnected: '#f44336',
  }

  const statusLabels: Record<SSEStatus, string> = {
    connecting: 'Conectando...',
    connected: 'Ao vivo',
    disconnected: 'Desconectado',
  }

  return (
    <div style={{
      width: 'var(--sidebar-width)',
      height: '100%',
      background: 'var(--color-sidebar)',
      borderRight: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 10px',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 20 }}>🧠</span>
          <h1 style={{
            color: 'var(--color-text)',
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: 0.5,
          }}>
            Brainstormer
          </h1>
        </div>

        {/* Status SSE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: statusColors[status],
            boxShadow: `0 0 6px ${statusColors[status]}`,
          }} />
          <span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>
            {statusLabels[status]}
          </span>
        </div>
      </div>

      {/* Instruções */}
      <div style={{
        padding: '8px 14px',
        background: 'rgba(233,69,96,0.08)',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 10, lineHeight: 1.5 }}>
          Clique num arquivo para adicioná-lo ao quadro. Coloque seus arquivos (e subpastas) na pasta <strong style={{ color: 'var(--color-text)' }}>files/</strong>
        </p>
      </div>

      {/* Lista de arquivos */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {files.length === 0 ? (
          <div style={{
            padding: '32px 16px',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📂</div>
            <p style={{ fontSize: 12, lineHeight: 1.6 }}>
              Nenhum arquivo encontrado.<br />
              Coloque imagens ou PDFs na pasta <strong style={{ color: 'var(--color-text)' }}>files/</strong> na raiz do projeto.
            </p>
          </div>
        ) : (
          <>
            {images.length > 0 && (
              <FileGroup
                title="🖼️ Imagens"
                files={images}
                onAdd={addImageCard}
                type="image"
              />
            )}
            {pdfs.length > 0 && (
              <FileGroup
                title="📄 PDFs"
                files={pdfs}
                onAdd={addPdfCard}
                type="pdf"
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── FileGroup ──────────────────────────────────────────────────

interface FileGroupProps {
  title: string
  files: FileItem[]
  onAdd: (file: FileItem) => void
  type: 'image' | 'pdf'
}

function FileGroup({ title, files, onAdd, type }: FileGroupProps) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{
        padding: '6px 14px 4px',
        color: 'var(--color-text-muted)',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: 'uppercase',
      }}>
        {title} ({files.length})
      </div>

      {files.map(file => (
            <FileRow
              key={file.name}
              file={file}
              onAdd={onAdd}
              type={type}
            />
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
  return (
    <button
      onClick={() => onAdd(file)}
      title={`Adicionar "${file.name}" ao quadro`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '6px 14px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.15s',
        borderRadius: 0,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-sidebar-hover)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 5,
        overflow: 'hidden',
        background: '#0d0d1a',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        {type === 'image' ? (
          <img
            src={file.url}
            alt={file.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => {
              // Se a imagem falhar, mostra ícone de fallback
              const img = e.currentTarget
              img.style.display = 'none'
              const parent = img.parentElement
              if (parent && !parent.querySelector('.fallback-icon')) {
                const span = document.createElement('span')
                span.className = 'fallback-icon'
                span.textContent = '🖼️'
                span.style.fontSize = '22px'
                parent.appendChild(span)
              }
            }}
          />
        ) : (
          <span style={{ fontSize: 22 }}>📄</span>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: 'var(--color-text)',
          fontSize: 11,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {file.displayName}
        </div>
        <div style={{
          color: 'var(--color-text-muted)',
          fontSize: 10,
          marginTop: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {file.folder && (
            <span style={{
              color: 'var(--color-accent)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }} title={file.folder}>
              📁 {file.folder}
            </span>
          )}
          <span style={{ flexShrink: 0 }}>{formatSize(file.size)}</span>
        </div>
      </div>

      {/* Add icon */}
      <span style={{ color: 'var(--color-text-muted)', fontSize: 14, flexShrink: 0 }}>＋</span>
    </button>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

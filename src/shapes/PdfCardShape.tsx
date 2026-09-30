import {
  BaseBoxShapeUtil,
  HTMLContainer,
  TLBaseShape,
  T,
} from 'tldraw'
import { PdfViewer } from '../components/PdfViewer'

export type PdfCardShape = TLBaseShape<
  'pdf-card',
  { w: number; h: number; url: string; label: string }
>

export class PdfCardShapeUtil extends BaseBoxShapeUtil<PdfCardShape> {
  static override type = 'pdf-card' as const

  static override props = {
    w: T.number,
    h: T.number,
    url: T.string,
    label: T.string,
  }

  override getDefaultProps(): PdfCardShape['props'] {
    return { w: 360, h: 480, url: '', label: '' }
  }

  override component(shape: PdfCardShape) {
    const { w, h, url, label } = shape.props

    return (
      <HTMLContainer>
        <div
          style={{
            width: w,
            height: h,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            border: '1.5px solid rgba(255,255,255,0.08)',
            userSelect: 'none',
          }}
        >
          {/* Header com nome do arquivo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 10px',
            background: 'rgba(233,69,96,0.15)',
            borderBottom: '1px solid rgba(233,69,96,0.3)',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 14 }}>📄</span>
            <span style={{
              color: '#eaeaea',
              fontSize: 11,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1,
            }} title={label}>
              {label}
            </span>
          </div>

          {/* Viewer */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <PdfViewer url={url} width={w} height={h - 30} />
          </div>
        </div>
      </HTMLContainer>
    )
  }

  override indicator(shape: PdfCardShape) {
    return (
      <rect
        width={shape.props.w}
        height={shape.props.h}
        rx={8}
        ry={8}
      />
    )
  }
}

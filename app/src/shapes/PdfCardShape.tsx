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
    const { w, h, url } = shape.props

    return (
      <HTMLContainer>
        <div
          style={{
            width: w,
            height: h,
            borderRadius: 6,
            overflow: 'hidden',
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
            userSelect: 'none',
          }}
        >
          <PdfViewer url={url} width={w} height={h} />
        </div>
      </HTMLContainer>
    )
  }

  override indicator(shape: PdfCardShape) {
    return (
      <rect
        width={shape.props.w}
        height={shape.props.h}
        rx={6}
        ry={6}
      />
    )
  }
}

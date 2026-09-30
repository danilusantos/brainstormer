import {
  BaseBoxShapeUtil,
  HTMLContainer,
  Rectangle2d,
  TLBaseShape,
  T,
} from 'tldraw'

export type ImageCardShape = TLBaseShape<
  'image-card',
  { w: number; h: number; url: string; label: string }
>

export class ImageCardShapeUtil extends BaseBoxShapeUtil<ImageCardShape> {
  static override type = 'image-card' as const

  static override props = {
    w: T.number,
    h: T.number,
    url: T.string,
    label: T.string,
  }

  override getDefaultProps(): ImageCardShape['props'] {
    return { w: 320, h: 240, url: '', label: '' }
  }

  override component(shape: ImageCardShape) {
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
            background: '#1a1a2e',
            border: '1.5px solid rgba(255,255,255,0.08)',
            userSelect: 'none',
          }}
        >
          {/* Imagem */}
          <div style={{ flex: 1, overflow: 'hidden', background: '#0d0d1a' }}>
            <img
              src={url}
              alt={label}
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>

          {/* Label */}
          {label && (
            <div
              style={{
                padding: '4px 8px',
                background: 'rgba(0,0,0,0.6)',
                color: '#eaeaea',
                fontSize: 11,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flexShrink: 0,
              }}
              title={label}
            >
              {label}
            </div>
          )}
        </div>
      </HTMLContainer>
    )
  }

  override indicator(shape: ImageCardShape) {
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

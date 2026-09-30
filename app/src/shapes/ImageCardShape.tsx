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
            borderRadius: 6,
            overflow: 'hidden',
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
            userSelect: 'none',
          }}
        >
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
      </HTMLContainer>
    )
  }

  override indicator(shape: ImageCardShape) {
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

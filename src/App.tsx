import { Tldraw } from 'tldraw'
import { ImageCardShapeUtil } from './shapes/ImageCardShape'
import { PdfCardShapeUtil } from './shapes/PdfCardShape'
import { Sidebar } from './components/Sidebar'
import { Toolbar } from './components/Toolbar'
import { WelcomeModal } from './components/WelcomeModal'
import { useFileWatcher } from './hooks/useFileWatcher'

// Shape utils definidos fora do componente para não recriar a cada render
const SHAPE_UTILS = [ImageCardShapeUtil, PdfCardShapeUtil]

export default function App() {
  const { files, status } = useFileWatcher()

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      overflow: 'hidden',
      background: 'var(--color-bg)',
    }}>
      {/* O tldraw ocupa toda a área, a sidebar e toolbar ficam sobrepostas */}
      <div style={{ position: 'relative', flex: 1, display: 'flex' }}>

        {/* Canvas tldraw */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <Tldraw
            shapeUtils={SHAPE_UTILS}
            persistenceKey="brainstormer-v1"
          >
            {/* Sidebar sobreposta à esquerda */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              zIndex: 200,
              pointerEvents: 'all',
            }}>
              <Sidebar files={files} status={status} />
            </div>

            {/* Toolbar sobreposta no topo centro */}
            <Toolbar />
          </Tldraw>
        </div>
      </div>

      {/* Modal de boas-vindas */}
      <WelcomeModal />
    </div>
  )
}

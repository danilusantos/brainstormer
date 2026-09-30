import { useState } from 'react'
import { Tldraw, type Editor } from 'tldraw'
import { ImageCardShapeUtil } from './shapes/ImageCardShape'
import { PdfCardShapeUtil } from './shapes/PdfCardShape'
import { Sidebar } from './components/Sidebar'
import { Toolbar } from './components/Toolbar'
import { WelcomeModal } from './components/WelcomeModal'
import { CanvasDropZone } from './components/CanvasDropZone'
import { PasteHandler } from './components/PasteHandler'
import { AutoSave } from './components/AutoSave'
import { useFileWatcher } from './hooks/useFileWatcher'

const SIDEBAR_WIDTH = 268

// Shape utils definidos fora do componente para não recriar a cada render
const SHAPE_UTILS = [ImageCardShapeUtil, PdfCardShapeUtil]

// Desabilita os handlers nativos do tldraw para drop/paste de arquivos e imagens.
// Isso evita a DUPLICAÇÃO: nós temos nossos próprios handlers (CanvasDropZone e
// PasteHandler) que salvam o arquivo no servidor e criam nossos cards customizados.
function handleMount(editor: Editor) {
  editor.registerExternalContentHandler('files', () => {
    // no-op: tratado pelo CanvasDropZone
  })
  editor.registerExternalContentHandler('file-replace', () => {
    // no-op: tratado pelo CanvasDropZone
  })
}

export default function App() {
  const { files, status } = useFileWatcher()
  const [collapsed, setCollapsed] = useState(false)

  // Empurra o menu superior esquerdo do tldraw para não ficar sob a sidebar.
  // Aberta: largura total; recolhida: só a barrinha de 48px.
  const leftInset = collapsed ? 48 : SIDEBAR_WIDTH

  return (
    <div
      className="flex h-screen w-screen overflow-hidden bg-bg"
      style={{ ['--brainstormer-left-inset' as string]: `${leftInset}px` }}
    >
      {/* O tldraw ocupa toda a área, a sidebar e toolbar ficam sobrepostas */}
      <div className="relative flex flex-1">

        {/* Canvas tldraw */}
        <div className="absolute inset-0">
          <Tldraw
            shapeUtils={SHAPE_UTILS}
            onMount={handleMount}
          >
            {/* Sidebar sobreposta à esquerda */}
            <div className="pointer-events-auto absolute left-0 top-0 z-[200] h-full">
              <Sidebar
                files={files}
                status={status}
                collapsed={collapsed}
                onToggle={() => setCollapsed(c => !c)}
              />
            </div>

            {/* Toolbar sobreposta no topo centro */}
            <Toolbar />

            {/* Drag & drop da sidebar para o canvas */}
            <CanvasDropZone />

            {/* Colar imagem com Ctrl+V */}
            <PasteHandler />

            {/* Auto-save do quadro no servidor */}
            <AutoSave />
          </Tldraw>
        </div>
      </div>

      {/* Modal de boas-vindas */}
      <WelcomeModal />
    </div>
  )
}

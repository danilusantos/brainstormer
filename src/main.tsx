import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GlobalWorkerOptions } from 'pdfjs-dist'
// Importa o worker do PDF.js como URL (padrão recomendado no Vite).
// O sufixo ?url faz o Vite servir o arquivo como asset estático.
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import 'tldraw/tldraw.css'
import './index.css'
import App from './App.tsx'

// Configurar o worker do PDF.js
GlobalWorkerOptions.workerSrc = pdfWorkerUrl

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

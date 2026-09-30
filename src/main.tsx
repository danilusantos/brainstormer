import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GlobalWorkerOptions } from 'pdfjs-dist'
import 'tldraw/tldraw.css'
import './index.css'
import App from './App.tsx'

// Configurar o worker do PDF.js
GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

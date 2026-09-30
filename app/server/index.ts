import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import chokidar from 'chokidar'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001

// Pasta do build de produção (front já compilado)
const DIST_DIR = path.resolve(__dirname, '../dist')

// Pasta de arquivos
const FILES_DIR = path.resolve(__dirname, '../assets/files')

// Criar pasta se não existir
if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR, { recursive: true })
  console.log(`📁 Pasta criada: ${FILES_DIR}`)
}

// Extensões suportadas
const SUPPORTED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf'])

// Tipos MIME
const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
}

// ── Helpers ────────────────────────────────────────────────────

interface FileEntry {
  name: string        // caminho relativo com "/" (ex: "subpasta/imagem.png")
  displayName: string // só o nome do arquivo (ex: "imagem.png")
  folder: string      // subpasta relativa ("" se raiz)
  ext: string
  type: 'image' | 'pdf'
  url: string         // URL encodada segmento a segmento
  size: number
  mtime: number
}

// Codifica um caminho relativo mantendo as barras "/" mas encodando cada segmento
function encodeRelativePath(relPath: string): string {
  return relPath
    .split('/')
    .map(seg => encodeURIComponent(seg))
    .join('/')
}

// Converte separadores do Windows (\) para "/" (padrão de URL)
function toPosix(p: string): string {
  return p.split(path.sep).join('/')
}

// Monta o objeto FileEntry a partir de um caminho absoluto
function buildFileEntry(absPath: string): FileEntry | null {
  const ext = path.extname(absPath).toLowerCase()
  if (!SUPPORTED_EXTENSIONS.has(ext)) return null

  const rel = toPosix(path.relative(FILES_DIR, absPath))
  const displayName = path.basename(absPath)
  const folder = toPosix(path.dirname(path.relative(FILES_DIR, absPath)))

  let stat: fs.Stats
  try {
    stat = fs.statSync(absPath)
  } catch {
    return null
  }

  return {
    name: rel,
    displayName,
    folder: folder === '.' ? '' : folder,
    ext,
    type: ext === '.pdf' ? 'pdf' : 'image',
    url: `/files/${encodeRelativePath(rel)}`,
    size: stat.size,
    mtime: stat.mtimeMs,
  }
}

// Percorre a pasta recursivamente e retorna todos os arquivos suportados
function scanFilesRecursive(dir: string): FileEntry[] {
  const results: FileEntry[] = []

  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return results
  }

  for (const entry of entries) {
    // Ignora arquivos/pastas ocultos
    if (entry.name.startsWith('.')) continue

    const full = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      results.push(...scanFilesRecursive(full))
    } else if (entry.isFile()) {
      const fileEntry = buildFileEntry(full)
      if (fileEntry) results.push(fileEntry)
    }
  }

  return results
}

// ── Middlewares ────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true)
    } else {
      callback(new Error('CORS bloqueado'))
    }
  },
  credentials: true,
}))
// Limite alto para aceitar imagens coladas em base64 (Ctrl+V)
app.use(express.json({ limit: '50mb' }))

// ── GET /api/files ── Lista recursiva de todos os arquivos suportados
app.get('/api/files', (_req, res) => {
  try {
    const files = scanFilesRecursive(FILES_DIR)
      .sort((a, b) => a.name.localeCompare(b.name))
    res.json({ files })
  } catch (err) {
    console.error('Erro ao listar arquivos:', err)
    res.status(500).json({ error: 'Erro ao listar arquivos' })
  }
})

// ── POST /api/upload ── Salva uma imagem colada (Ctrl+V) na pasta de arquivos
// Recebe { dataUrl: "data:image/png;base64,...", suggestedName?: string }
const EXT_BY_MIME: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp',
}

app.post('/api/upload', (req, res) => {
  try {
    const { dataUrl } = req.body as { dataUrl?: string }

    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ error: 'dataUrl ausente' })
    }

    // Formato esperado: data:image/png;base64,AAAA...
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
    if (!match) {
      return res.status(400).json({ error: 'Formato de dataUrl inválido' })
    }

    const mime = match[1]
    const base64 = match[2]
    const ext = EXT_BY_MIME[mime]

    if (!ext) {
      return res.status(415).json({ error: `Tipo não suportado: ${mime}` })
    }

    // Nome único baseado em timestamp
    const now = new Date()
    const stamp = now.toISOString().slice(0, 19).replace(/[T:]/g, '-')
    const filename = `colado-${stamp}${ext}`
    const filePath = path.join(FILES_DIR, filename)

    const buffer = Buffer.from(base64, 'base64')
    fs.writeFileSync(filePath, buffer)

    console.log(`📋 Imagem colada salva: ${filename} (${buffer.length} bytes)`)

    // Retorna o FileEntry para o frontend criar o card imediatamente
    const entry = buildFileEntry(filePath)
    res.json({ file: entry })
  } catch (err) {
    console.error('Erro no upload:', err)
    res.status(500).json({ error: 'Erro ao salvar imagem' })
  }
})

// ── Auto-save do quadro ────────────────────────────────────────
// O estado do quadro (snapshot do tldraw) é salvo em assets/board/ultimo.json
const BOARD_DIR = path.resolve(__dirname, '../assets/board')
const BOARD_FILE = path.join(BOARD_DIR, 'ultimo.json')

if (!fs.existsSync(BOARD_DIR)) {
  fs.mkdirSync(BOARD_DIR, { recursive: true })
}

// POST /api/board — grava o snapshot do quadro
app.post('/api/board', (req, res) => {
  try {
    const data = req.body
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Corpo inválido' })
    }
    fs.writeFileSync(BOARD_FILE, JSON.stringify(data))
    res.json({ ok: true, savedAt: Date.now() })
  } catch (err) {
    console.error('Erro ao salvar quadro:', err)
    res.status(500).json({ error: 'Erro ao salvar quadro' })
  }
})

// GET /api/board — retorna o último quadro salvo (ou null se não existir)
app.get('/api/board', (_req, res) => {
  try {
    if (!fs.existsSync(BOARD_FILE)) {
      return res.json({ board: null })
    }
    const raw = fs.readFileSync(BOARD_FILE, 'utf-8')
    const board = JSON.parse(raw)
    res.json({ board })
  } catch (err) {
    console.error('Erro ao ler quadro:', err)
    res.status(500).json({ error: 'Erro ao ler quadro' })
  }
})

// GET /files/* ── Serve o arquivo (suporta subpastas)
// Usa regex para capturar o caminho relativo completo, incluindo "/" e caracteres especiais.
app.get(/^\/files\/(.+)$/, (req, res) => {
  const raw = req.params[0]

  // Decodifica cada segmento do caminho de forma segura
  let relPath: string
  try {
    relPath = raw
      .split('/')
      .map((seg: string) => decodeURIComponent(seg))
      .join(path.sep)
  } catch {
    relPath = raw
  }

  // Resolve o caminho absoluto e garante que está dentro de FILES_DIR (anti path-traversal)
  const filePath = path.resolve(FILES_DIR, relPath)
  const baseResolved = path.resolve(FILES_DIR)

  if (!filePath.startsWith(baseResolved + path.sep) && filePath !== baseResolved) {
    return res.status(403).json({ error: 'Acesso negado' })
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    console.warn(`⚠️  404: arquivo não encontrado -> "${relPath}"`)
    return res.status(404).json({ error: 'Arquivo não encontrado', name: relPath })
  }

  const ext = path.extname(filePath).toLowerCase()
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream'

  res.setHeader('Content-Type', mimeType)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'public, max-age=3600')

  fs.createReadStream(filePath).pipe(res)
})

// ── GET /api/watch ── SSE para monitoramento em tempo real
const sseClients = new Set<express.Response>()

app.get('/api/watch', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('X-Accel-Buffering', 'no') // desabilita buffer em proxies nginx/vite
  res.flushHeaders()

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n')
  }, 15000)

  sseClients.add(res)
  console.log(`👁️  Cliente SSE conectado (total: ${sseClients.size})`)

  req.on('close', () => {
    clearInterval(heartbeat)
    sseClients.delete(res)
    console.log(`👋 Cliente SSE desconectado (total: ${sseClients.size})`)
  })
})

function broadcastSSE(event: string, data: object) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  sseClients.forEach(client => {
    try {
      client.write(payload)
    } catch {
      sseClients.delete(client)
    }
  })
}

// ── Chokidar: monitorar pasta de arquivos (recursivo) ──────────
const watcher = chokidar.watch(FILES_DIR, {
  ignored: /(^|[/\\])\../, // ignora arquivos/pastas ocultos
  persistent: true,
  ignoreInitial: true, // não dispara evento para arquivos que ja existem
  awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
})

watcher
  .on('add', absPath => {
    const entry = buildFileEntry(absPath)
    if (!entry) return
    console.log(`➕ Arquivo adicionado: ${entry.name}`)
    broadcastSSE('add', entry)
  })
  .on('unlink', absPath => {
    const rel = toPosix(path.relative(FILES_DIR, absPath))
    const ext = path.extname(absPath).toLowerCase()
    if (!SUPPORTED_EXTENSIONS.has(ext)) return
    console.log(`➖ Arquivo removido: ${rel}`)
    broadcastSSE('unlink', { name: rel })
  })
  .on('change', absPath => {
    const entry = buildFileEntry(absPath)
    if (!entry) return
    console.log(`🔄 Arquivo modificado: ${entry.name}`)
    broadcastSSE('change', entry)
  })

// ── Front-end estático (build de produção) ─────────────────────
// Servido DEPOIS das rotas de API/arquivos para não interceptá-las.
// O cliente acessa o app inteiro em http://localhost:3001
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))

  // Fallback SPA: qualquer rota que não seja /api ou /files devolve o index.html
  app.get(/^(?!\/(api|files)\/).*/, (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'))
  })
} else {
  console.warn('⚠️  Pasta dist/ não encontrada. Rode "npm run build" para gerar o front.')
}

// Iniciar servidor
app.listen(PORT, () => {
  const initialCount = scanFilesRecursive(FILES_DIR).length
  const hasBuild = fs.existsSync(DIST_DIR)
  console.log('')
  console.log('🚀 Brainstormer rodando!')
  console.log(`   Acesse:   http://localhost:${PORT}`)
  console.log(`   Arquivos: ${FILES_DIR}`)
  console.log(`   Encontrados: ${initialCount} arquivo(s) (incluindo subpastas)`)
  if (!hasBuild) {
    console.log('   ⚠️  Front não compilado — rode "npm run build"')
  }
  console.log('')
})

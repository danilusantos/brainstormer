import { useState, useEffect, useRef, useCallback } from 'react'
import type { FileItem, SSEStatus } from '../types'

export function useFileWatcher() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [status, setStatus] = useState<SSEStatus>('connecting')
  const eventSourceRef = useRef<EventSource | null>(null)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryCountRef = useRef(0)

  // Carrega a lista inicial de arquivos
  const loadFiles = useCallback(async () => {
    try {
      const res = await fetch('/api/files')
      if (!res.ok) throw new Error('Falha ao carregar arquivos')
      const data = await res.json()
      setFiles(data.files)
    } catch (err) {
      console.error('Erro ao carregar arquivos:', err)
    }
  }, [])

  // Conecta ao SSE
  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    setStatus('connecting')
    const es = new EventSource('/api/watch')
    eventSourceRef.current = es

    es.onopen = () => {
      setStatus('connected')
      retryCountRef.current = 0
      console.log('SSE conectado')
    }

    // Arquivo adicionado
    es.addEventListener('add', (e: MessageEvent) => {
      const file: FileItem = JSON.parse(e.data)
      setFiles(prev => {
        if (prev.find(f => f.name === file.name)) return prev
        return [...prev, file].sort((a, b) => a.name.localeCompare(b.name))
      })
    })

    // Arquivo removido
    es.addEventListener('unlink', (e: MessageEvent) => {
      const { name } = JSON.parse(e.data)
      setFiles(prev => prev.filter(f => f.name !== name))
    })

    // Arquivo modificado
    es.addEventListener('change', (e: MessageEvent) => {
      const file: FileItem = JSON.parse(e.data)
      setFiles(prev => prev.map(f => f.name === file.name ? file : f))
    })

    es.onerror = () => {
      setStatus('disconnected')
      es.close()
      eventSourceRef.current = null

      // Reconexão com backoff exponencial (máx 30s)
      const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000)
      retryCountRef.current += 1
      console.log(`SSE desconectado. Reconectando em ${delay / 1000}s...`)

      retryTimerRef.current = setTimeout(() => {
        connect()
      }, delay)
    }
  }, [])

  useEffect(() => {
    loadFiles()
    connect()

    return () => {
      eventSourceRef.current?.close()
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
    }
  }, [loadFiles, connect])

  return { files, status, reload: loadFiles }
}

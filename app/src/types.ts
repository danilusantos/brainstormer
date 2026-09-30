export interface FileItem {
  name: string        // caminho relativo com "/" (ex: "subpasta/imagem.png")
  displayName: string // só o nome do arquivo (ex: "imagem.png")
  folder: string      // subpasta relativa ("" se raiz)
  ext: string
  type: 'image' | 'pdf'
  url: string
  size: number
  mtime: number
}

export type SSEStatus = 'connecting' | 'connected' | 'disconnected'

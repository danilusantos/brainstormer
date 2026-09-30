import { useState, useEffect } from 'react'
import { Brain, FolderOpen, MousePointerClick, Move, Pencil, Save } from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import type { ComponentType } from 'react'

const STORAGE_KEY = 'brainstormer-welcome-seen'

export function WelcomeModal() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY)
    if (!seen) setVisible(true)
  }, [])

  function handleClose() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[90%] max-w-md rounded-2xl border border-subtle bg-surface p-8 shadow-float">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft">
            <Brain size={24} className="text-brand" strokeWidth={2.2} />
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">Bem-vindo ao Brainstormer</h2>
          <p className="mt-1 text-sm text-ink-muted">Seu quadro visual de ideias</p>
        </div>

        <div className="mb-7 flex flex-col gap-3.5">
          <Step icon={FolderOpen} text={<>Coloque imagens e PDFs na pasta <strong className="text-ink">files/</strong></>} />
          <Step icon={MousePointerClick} text="Clique ou arraste um arquivo da lateral para o quadro" />
          <Step icon={Move} text="Mova e redimensione os cards livremente" />
          <Step icon={Pencil} text="Use as ferramentas para desenhar e escrever" />
          <Step icon={Save} text="Tudo é salvo automaticamente e restaurado ao reabrir" />
        </div>

        <button
          onClick={handleClose}
          className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Começar
        </button>
      </div>
    </div>
  )
}

function Step({ icon: Icon, text }: { icon: ComponentType<LucideProps>; text: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-surface-hover">
        <Icon size={14} className="text-ink-secondary" />
      </div>
      <p className="text-sm leading-relaxed text-ink-secondary">{text}</p>
    </div>
  )
}

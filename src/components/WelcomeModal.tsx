import { useState, useEffect } from 'react'

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
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#16213e',
        border: '1px solid rgba(233,69,96,0.3)',
        borderRadius: 16,
        padding: '36px 40px',
        maxWidth: 480,
        width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        animation: 'fadeIn 0.3s ease',
      }}>
        <style>{`@keyframes fadeIn { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }`}</style>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🧠</div>
          <h2 style={{
            color: '#eaeaea',
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 6,
          }}>
            Bem-vindo ao Brainstormer!
          </h2>
          <p style={{ color: '#8892a4', fontSize: 13 }}>
            Seu quadro visual de ideias
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
          <Step icon="📁" text={<>Coloque seus arquivos (imagens e PDFs) na pasta <strong style={{ color: '#eaeaea' }}>files/</strong> na raiz do projeto</>} />
          <Step icon="🖱️" text="Clique num arquivo na barra lateral para adicioná-lo ao quadro" />
          <Step icon="↔️" text="Arraste e redimensione os cards livremente pelo quadro" />
          <Step icon="✏️" text="Use as ferramentas do tldraw para desenhar, escrever e conectar ideias" />
          <Step icon="💾" text="Salve seu quadro com o botão Exportar e restaure depois com Importar" />
        </div>

        <button
          onClick={handleClose}
          style={{
            width: '100%',
            padding: '12px',
            background: '#e94560',
            border: 'none',
            borderRadius: 10,
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: 0.5,
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#c73652' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#e94560' }}
        >
          Entendido, vamos lá! 🚀
        </button>
      </div>
    </div>
  )
}

function Step({ icon, text }: { icon: string; text: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <p style={{ color: '#8892a4', fontSize: 13, lineHeight: 1.5, margin: 0 }}>{text}</p>
    </div>
  )
}

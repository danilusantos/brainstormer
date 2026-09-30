# 🧠 Brainstormer

Quadro visual interativo para organizar ideias com imagens e PDFs.

## Como usar

### 1. Primeira vez
Dê duplo clique no arquivo **`instalar-node.bat`** para instalar o Node.js.

### 2. Iniciar o app
Dê duplo clique no arquivo **`iniciar.bat`**.

O app vai:
- Verificar se o Node.js está instalado (instalar se necessário)
- Instalar as dependências na primeira vez
- Iniciar o servidor e abrir o navegador automaticamente

### 3. Adicionar arquivos
Coloque seus arquivos na pasta **`files\`** da raiz do projeto.

Formatos suportados:
- **Imagens:** PNG, JPG, JPEG, GIF, WEBP
- **PDFs:** abre com navegação de páginas

Os arquivos aparecem automaticamente na barra lateral sem precisar recarregar.

### 4. Usar o quadro

| Ação | Como fazer |
|------|-----------|
| Adicionar ao quadro | Clique no arquivo na barra lateral |
| Mover um card | Arraste pelo quadro |
| Redimensionar | Arraste as bordas/cantos do card |
| Navegar PDF | Use os botões ◀ ▶ no card |
| Desenhar | Use as ferramentas do tldraw (lápis) |
| Escrever | Use a ferramenta de texto |
| Zoom | Scroll do mouse ou pinça no trackpad |
| Pan | Segure Espaço e arraste |
| Exportar quadro | Botão 💾 **Exportar** (salva um JSON) |
| Restaurar quadro | Botão 📂 **Importar** (abre o JSON salvo) |

### 5. Encerrar
Feche a janela do `iniciar.bat` para encerrar o servidor.

---

## Estrutura do projeto

```
brainstormer/
├── files/              ← Coloque seus arquivos aqui (link para assets/files/)
├── assets/
│   └── files/          ← Pasta real dos arquivos
├── src/                ← Código frontend (React + TypeScript)
├── server/             ← Servidor Node.js (Express)
├── instalar-node.bat   ← Instala o Node.js
├── iniciar.bat         ← Inicia o app
└── README.md
```

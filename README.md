# 🧠 Brainstormer

Quadro visual interativo para organizar ideias com imagens e PDFs.

## Como usar

### 1. Iniciar o app
Dê duplo clique em **`Brainstormer`** (o atalho) ou em **`iniciar.bat`**.

Ele faz tudo sozinho:
- Verifica o Node.js e **instala automaticamente** se não encontrar
- Instala as dependências na primeira vez
- Sobe o servidor e abre o navegador em `http://localhost:3001`

Não precisa clicar em mais nada. Para encerrar, feche a janela do `iniciar.bat`.

> A instalação do Node.js pede permissão de administrador (janela do Windows).
> É só confirmar.

### 2. Adicionar arquivos ao quadro
Três formas, todas salvam o arquivo na pasta **`files/`** automaticamente:
- **Colar** com `Ctrl+V` (ex: um print ou imagem copiada do navegador)
- **Arrastar** de outra pasta direto para o quadro
- **Colocar manualmente** na pasta `files/` — aparece na barra lateral na hora

Formatos suportados:
- **Imagens:** PNG, JPG, JPEG, GIF, WEBP
- **PDFs:** abrem com navegação de páginas

### 3. Usar o quadro

| Ação | Como fazer |
|------|-----------|
| Adicionar ao quadro | Clique ou arraste o arquivo na barra lateral |
| Buscar / filtrar | Campo de busca + abas Todos / Imagens / PDFs |
| Mover um card | Arraste pelo quadro |
| Redimensionar | Arraste as bordas/cantos do card |
| Navegar no PDF | Botões de página no card |
| Desenhar / escrever | Ferramentas do tldraw |
| Ocultar barra lateral | Botão de recolher no topo da barra |
| Zoom | Scroll do mouse |
| Salvar quadro | Automático (e botões Exportar / Importar JSON) |

O quadro é **salvo automaticamente** e restaurado quando você reabre o app.

---

## Arquitetura

Um **único servidor** (Node.js + Express) roda localmente na porta `3001`:
- Serve a interface já compilada (pasta `app/dist/`, versionada no repositório)
- Expõe a API que lê, serve e salva os arquivos da pasta `files/`
- Observa a pasta `files/` e atualiza a barra lateral em tempo real

Não há deploy em nuvem: tudo roda na máquina do usuário, e os arquivos ficam
no disco local. Por isso o cliente só precisa baixar o repositório e clicar.

> O `dist/` (build de produção) é versionado de propósito, para o cliente não
> precisar compilar nada. Se você alterar o código-fonte, rode `npm run build`
> em `app/` e faça commit do `dist/` atualizado.

## Estrutura do projeto

A raiz fica enxuta para o cliente. Todo o código vive dentro de `app/`.

```
brainstormer/
├── Brainstormer.lnk    ← Atalho com ícone (aponta para iniciar.bat)
├── iniciar.bat         ← Inicia o app (1 clique)
├── files/              ← Seus arquivos (link para app/assets/files/)
├── README.md
└── app/                ← Projeto (código, servidor, build)
    ├── assets/
    │   ├── files/      ← Pasta real dos arquivos
    │   └── board/      ← Quadro salvo automaticamente (não versionado)
    ├── dist/           ← Build de produção (versionado)
    ├── src/            ← Código-fonte do front (React + TypeScript)
    ├── server/         ← Servidor Node.js (Express)
    └── scripts/        ← Scripts .ps1 usados pelo iniciar.bat
        ├── verificar-node.ps1
        ├── instalar-node.ps1
        ├── instalar-dependencias.ps1
        └── iniciar-servidor.ps1
```

## Desenvolvimento

Todos os comandos rodam dentro de `app/`:

```bash
cd app
npm install
npm run dev      # sobe o servidor (watch) + Vite dev server

npm run build    # gera o dist/
npm run start    # sobe só o servidor, servindo o dist/ em localhost:3001
```

## Publicar uma nova versão

O build e a release são automáticos via GitHub Actions. Para lançar:

```bash
git tag 1.0.1v      # use o padrão X.Y.Zv
git push origin 1.0.1v
```

Ao receber a tag, o CI compila o projeto, empacota um `.zip` pronto para o
cliente (com o build atualizado) e cria a release no GitHub com esse arquivo
anexado. Não é preciso buildar nem commitar o `dist/` manualmente.

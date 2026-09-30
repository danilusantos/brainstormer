#!/usr/bin/env node
/**
 * postinstall.js
 *
 * Aplica o patch do rollup para usar @rollup/wasm-node como fallback
 * quando o binário nativo é bloqueado pelo Windows AppControl/Smart App Control.
 *
 * Também copia os arquivos wasm necessários para a pasta dist do rollup.
 */

import { execSync } from 'child_process'
import { existsSync, cpSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// 1. Aplicar patch-package patches
try {
  execSync('npx patch-package', { cwd: root, stdio: 'inherit' })
} catch {
  console.warn('⚠️  patch-package falhou (normal em primeira execução)')
}

// 2. Copiar pasta wasm-node do @rollup/wasm-node para rollup/dist/
const wasmSrc = join(root, 'node_modules/@rollup/wasm-node/dist/wasm-node')
const wasmDst = join(root, 'node_modules/rollup/dist/wasm-node')

if (existsSync(wasmSrc) && !existsSync(wasmDst)) {
  cpSync(wasmSrc, wasmDst, { recursive: true })
  console.log('✅ wasm-node copiado para rollup/dist/')
}

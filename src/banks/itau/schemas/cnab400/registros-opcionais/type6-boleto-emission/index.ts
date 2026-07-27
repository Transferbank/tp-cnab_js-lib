/**
 * Itaú (341) — CNAB 400 — Registro Tipo 6 (Emissão de Boleto)
 *
 * Família de registros paralela e independente ao fluxo tipo 1/2/4/5.
 * Serve para o cedente pedir ao Itaú que emita fisicamente o boleto.
 *
 * IMPORTANTE:
 * - Usa o mesmo header e trailer já implementados (../header.ts e ../trailer.ts)
 * - Tem 4 layouts diferentes identificados pelo campo codigo_layout (posição 2):
 *   - Layout 1: Dados do título
 *   - Layout 2: Instruções (linhas 1-5)
 *   - Layout 3: Instruções (linhas 6-9)
 *   - Layout 4: Extensão de dados do sacador/avalista
 */

export { TYPE6_LAYOUT1_TITLE } from './layout1-title'
export { TYPE6_LAYOUT2_INSTRUCTIONS_1_5 } from './layout2-instructions-1-5'
export { TYPE6_LAYOUT3_INSTRUCTIONS_6_9 } from './layout3-instructions-6-9'
export { TYPE6_LAYOUT4_ENDORSER } from './layout4-endorser'

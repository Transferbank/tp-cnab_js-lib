/**
 * Santander (033) — CNAB 240 — Segmentos Opcionais
 *
 * Segmentos complementares que podem acompanhar os segmentos obrigatórios P e Q.
 *
 * DISPONÍVEIS:
 * - Segmento R: Descontos, multa, débito automático
 * - Segmento S: Mensagens para impressão no boleto (com variantes)
 * - Segmento Y03: Chave de Pix (geração, consulta)
 * - Segmento Y53: Dados adicionais do título e instrução de protesto
 */

export { SANTANDER_CNAB240_SEGMENT_R } from './segment-r'
export {
  SANTANDER_CNAB240_SEGMENT_S,
  SANTANDER_CNAB240_SEGMENT_S_FORM,
  SANTANDER_CNAB240_SEGMENT_S_MESSAGES,
} from './segment-s'
export {
  identifySegmentSVariant,
  parseSegmentS,
  extractSegmentSMessages,
  isSegmentS,
} from './segment-s-helper'
export { SANTANDER_CNAB240_SEGMENT_Y03 } from './segment-y03'
export { SANTANDER_CNAB240_SEGMENT_Y53 } from './segment-y53'
export {
  resolveY53Amount,
  resolveMaxAmount,
  resolveMinAmount,
} from './segment-y53-helper'

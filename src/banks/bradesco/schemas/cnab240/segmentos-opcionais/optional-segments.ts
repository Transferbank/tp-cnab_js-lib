/**
 * Bradesco (237) — CNAB 240 — Segmentos Opcionais
 *
 * Segmentos complementares que podem acompanhar os segmentos obrigatórios P e Q.
 *
 * DISPONÍVEIS:
 * - Segmento R: Descontos, multa, débito automático
 * - Segmento S: Mensagens para impressão no boleto (com variantes)
 * - Segmento Y01: Chave de Pix (cadastramento, consulta)
 * - Segmento Y04: Notificação eletrônica ao pagador
 * - Segmento Y50: Protesto/Negativação
 */

export { BRADESCO_CNAB240_SEGMENT_R } from './segment-r'
export {
  BRADESCO_CNAB240_SEGMENT_S_BASE,
  BRADESCO_CNAB240_SEGMENT_S_MESSAGE,
  BRADESCO_CNAB240_SEGMENT_S_INFO,
} from './segment-s'
export {
  SegmentSPrintType,
  identifySegmentSVariant,
  parseSegmentS,
  extractSegmentSMessages,
  isSegmentS,
} from './segment-s-helper'
export type {
  SegmentSVariantInfo,
  ParsedSegmentS,
} from './segment-s-helper'
export { BRADESCO_CNAB240_SEGMENT_Y01 } from './segment-y01'
export { BRADESCO_CNAB240_SEGMENT_Y04 } from './segment-y04'
export { BRADESCO_CNAB240_SEGMENT_Y50 } from './segment-y50'

/**
 * Sicredi (748) — CNAB 240 — Segmentos Opcionais
 *
 * Segmentos complementares que podem acompanhar os segmentos obrigatórios P e Q.
 *
 * DISPONÍVEIS:
 * - Segmento R: Descontos, multa, débito automático
 * - Segmento S: Mensagens para impressão no boleto (com variantes)
 * - Segmento Y01: Chave de Pix (cadastramento, consulta)
 * - Segmento Y04: Notificação eletrônica ao pagador
 */

export { SICREDI_CNAB240_SEGMENT_R } from './segment-r'
export {
  SICREDI_CNAB240_SEGMENT_S,
  SICREDI_CNAB240_SEGMENT_S_FRONT_BACK,
  SICREDI_CNAB240_SEGMENT_S_BODY_INSTRUCTIONS,
} from './segment-s'
export {
  identifySegmentSVariant,
  parseSegmentS,
  extractSegmentSMessages,
  isSegmentS,
} from './segment-s-helper'
export { SICREDI_CNAB240_SEGMENT_Y01 } from './segment-y01'
export { SICREDI_CNAB240_SEGMENT_Y04 } from './segment-y04'

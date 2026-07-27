/**
 * Bradesco (237) — CNAB 240
 * 
 * Schema modularizado do Bradesco para CNAB 240.
 * Cada segmento está em seu próprio arquivo para facilitar manutenção.
 * 
 * Estrutura de um arquivo CNAB 240 de remessa (cada linha tem exatamente 240 caracteres):
 *   - Header de Arquivo (pos 8 = '0')
 *   - Segmento P (pos 8 = '3', pos 14 = 'P') - dados financeiros
 *   - Segmento Q (pos 8 = '3', pos 14 = 'Q') - dados do pagador
 *   - Segmento R (pos 8 = '3', pos 14 = 'R') - descontos/multa/débito automático (opcional)
 *   - Segmento S (pos 8 = '3', pos 14 = 'S') - mensagens para impressão (opcional)
 *   - Trailer de Arquivo (pos 8 = '9')
 * 
 * Fonte do layout: pycnab240 + cnab_yaml generic FEBRABAN + Manual oficial Bradesco
 */

import { BankSchema, BANK_CODES } from '../../../../types'
import { BRADESCO_CNAB240_HEADER } from './header'
import { BRADESCO_CNAB240_BATCH_HEADER } from './batch-header'
import { BRADESCO_CNAB240_SEGMENT_P } from './segment-p'
import { BRADESCO_CNAB240_SEGMENT_Q } from './segment-q'
import { BRADESCO_CNAB240_SEGMENT_R } from './segment-r'
import { BRADESCO_CNAB240_SEGMENT_S_BASE } from './segment-s'
import { BRADESCO_CNAB240_SEGMENT_Y01 } from './segment-y01'
import { BRADESCO_CNAB240_SEGMENT_Y04 } from './segment-y04'
import { BRADESCO_CNAB240_SEGMENT_Y50 } from './segment-y50'
import { BRADESCO_CNAB240_BATCH_TRAILER } from './batch-trailer'
import { BRADESCO_CNAB240_TRAILER } from './trailer'

export const bradescoCnab240: BankSchema = {
  bankCode: BANK_CODES.BRADESCO,
  bankName: 'Bradesco',
  headerArquivo: BRADESCO_CNAB240_HEADER,
  headerLote: BRADESCO_CNAB240_BATCH_HEADER,
  segmentoP: BRADESCO_CNAB240_SEGMENT_P,
  segmentoQ: BRADESCO_CNAB240_SEGMENT_Q,
  trailerLote: BRADESCO_CNAB240_BATCH_TRAILER,
  trailerArquivo: BRADESCO_CNAB240_TRAILER,
  optionalRecords: [
    { identifier: 'R', schema: BRADESCO_CNAB240_SEGMENT_R },
    { identifier: 'S', schema: BRADESCO_CNAB240_SEGMENT_S_BASE },
    { identifier: 'Y01', schema: BRADESCO_CNAB240_SEGMENT_Y01 },
    { identifier: 'Y04', schema: BRADESCO_CNAB240_SEGMENT_Y04 },
    { identifier: 'Y50', schema: BRADESCO_CNAB240_SEGMENT_Y50 },
  ],
}

// Re-exporta os schemas individuais para uso direto se necessário
export { BRADESCO_CNAB240_HEADER } from './header'
export { BRADESCO_CNAB240_BATCH_HEADER } from './batch-header'
export { BRADESCO_CNAB240_SEGMENT_P } from './segment-p'
export { BRADESCO_CNAB240_SEGMENT_Q } from './segment-q'
export { BRADESCO_CNAB240_SEGMENT_R } from './segment-r'
export { BRADESCO_CNAB240_SEGMENT_Y01 } from './segment-y01'
export { BRADESCO_CNAB240_SEGMENT_Y04 } from './segment-y04'
export { BRADESCO_CNAB240_SEGMENT_Y50 } from './segment-y50'
export { BRADESCO_CNAB240_BATCH_TRAILER } from './batch-trailer'
export { BRADESCO_CNAB240_TRAILER } from './trailer'

// Segmento S: possui variantes, use o helper para parsing correto
export {
  BRADESCO_CNAB240_SEGMENT_S_BASE,
  BRADESCO_CNAB240_SEGMENT_S_MESSAGE,
  BRADESCO_CNAB240_SEGMENT_S_INFO,
} from './segment-s'

// Helper para identificar e parsear variantes do Segmento S
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

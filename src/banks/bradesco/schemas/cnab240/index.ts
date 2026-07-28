/**
 * Bradesco (237) — CNAB 240
 * 
 * Segmentos opcionais: R (descontos/multa), S (mensagens), Y01/Y04/Y50
 * Fonte: pycnab240, cnab_yaml FEBRABAN, Manual oficial Bradesco
 */

import { BankSchema, BANK_CODES } from '@tp-types/index'
import { BRADESCO_CNAB240_HEADER } from './header'
import { BRADESCO_CNAB240_BATCH_HEADER } from './batch-header'
import { BRADESCO_CNAB240_SEGMENT_P } from './segment-p'
import { BRADESCO_CNAB240_SEGMENT_Q } from './segment-q'
import { BRADESCO_CNAB240_SEGMENT_R } from './segmentos-opcionais/segment-r'
import { BRADESCO_CNAB240_SEGMENT_S_BASE } from './segmentos-opcionais/segment-s'
import { BRADESCO_CNAB240_SEGMENT_Y01 } from './segmentos-opcionais/segment-y01'
import { BRADESCO_CNAB240_SEGMENT_Y04 } from './segmentos-opcionais/segment-y04'
import { BRADESCO_CNAB240_SEGMENT_Y50 } from './segmentos-opcionais/segment-y50'
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

export { BRADESCO_CNAB240_HEADER } from './header'
export { BRADESCO_CNAB240_BATCH_HEADER } from './batch-header'
export { BRADESCO_CNAB240_SEGMENT_P } from './segment-p'
export { BRADESCO_CNAB240_SEGMENT_Q } from './segment-q'
export { BRADESCO_CNAB240_SEGMENT_R } from './segmentos-opcionais/segment-r'
export { BRADESCO_CNAB240_SEGMENT_Y01 } from './segmentos-opcionais/segment-y01'
export { BRADESCO_CNAB240_SEGMENT_Y04 } from './segmentos-opcionais/segment-y04'
export { BRADESCO_CNAB240_SEGMENT_Y50 } from './segmentos-opcionais/segment-y50'
export { BRADESCO_CNAB240_BATCH_TRAILER } from './batch-trailer'
export { BRADESCO_CNAB240_TRAILER } from './trailer'

export {
  BRADESCO_CNAB240_SEGMENT_S_BASE,
  BRADESCO_CNAB240_SEGMENT_S_MESSAGE,
  BRADESCO_CNAB240_SEGMENT_S_INFO,
} from './segmentos-opcionais/segment-s'

export {
  SegmentSPrintType,
  identifySegmentSVariant,
  parseSegmentS,
  extractSegmentSMessages,
  isSegmentS,
} from './segmentos-opcionais/segment-s-helper'

export type {
  SegmentSVariantInfo,
  ParsedSegmentS,
} from './segmentos-opcionais/segment-s-helper'

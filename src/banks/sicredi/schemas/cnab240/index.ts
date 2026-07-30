/**
 * Exportações centralizadas dos schemas Sicredi CNAB 240
 * 
 * Estrutura modular seguindo o padrão do Bradesco e Santander.
 */

import { BankSchema, BANK_CODES } from '@tp-types/index'

export { SICREDI_CNAB240_FILE_HEADER } from './header'
export { SICREDI_CNAB240_BATCH_HEADER } from './batch-header'
export { SICREDI_CNAB240_SEGMENT_P } from './segment-p'
export { resolveTitleAmount, resolveTitleAmountSegmentP } from './segment-p-helper'
export { SICREDI_CNAB240_SEGMENT_Q } from './segment-q'
export { SICREDI_CNAB240_SEGMENT_R } from './segmentos-opcionais/segment-r'
export {
  SICREDI_CNAB240_SEGMENT_S,
  SICREDI_CNAB240_SEGMENT_S_FRONT_BACK,
  SICREDI_CNAB240_SEGMENT_S_BODY_INSTRUCTIONS,
} from './segmentos-opcionais/segment-s'
export {
  isSegmentS,
  identifySegmentSVariant,
  parseSegmentS,
  extractSegmentSMessages,
} from './segmentos-opcionais/segment-s-helper'
export { SICREDI_CNAB240_SEGMENT_Y01 } from './segmentos-opcionais/segment-y01'
export { SICREDI_CNAB240_SEGMENT_Y04 } from './segmentos-opcionais/segment-y04'
export { SICREDI_CNAB240_BATCH_TRAILER } from './batch-trailer'
export { SICREDI_CNAB240_FILE_TRAILER } from './trailer'

// Import para BankSchema
import { SICREDI_CNAB240_FILE_HEADER } from './header'
import { SICREDI_CNAB240_BATCH_HEADER } from './batch-header'
import { SICREDI_CNAB240_SEGMENT_P } from './segment-p'
import { SICREDI_CNAB240_SEGMENT_Q } from './segment-q'
import { SICREDI_CNAB240_SEGMENT_R } from './segmentos-opcionais/segment-r'
import { SICREDI_CNAB240_SEGMENT_S_FRONT_BACK } from './segmentos-opcionais/segment-s'
import { SICREDI_CNAB240_SEGMENT_Y01 } from './segmentos-opcionais/segment-y01'
import { SICREDI_CNAB240_SEGMENT_Y04 } from './segmentos-opcionais/segment-y04'
import { SICREDI_CNAB240_BATCH_TRAILER } from './batch-trailer'
import { SICREDI_CNAB240_FILE_TRAILER } from './trailer'

export const sicrediCnab240: BankSchema = {
  bankCode: BANK_CODES.SICREDI,
  bankName: 'Sicredi',
  headerArquivo: SICREDI_CNAB240_FILE_HEADER,
  headerLote: SICREDI_CNAB240_BATCH_HEADER,
  segmentoP: SICREDI_CNAB240_SEGMENT_P,
  segmentoQ: SICREDI_CNAB240_SEGMENT_Q,
  trailerLote: SICREDI_CNAB240_BATCH_TRAILER,
  trailerArquivo: SICREDI_CNAB240_FILE_TRAILER,
  optionalRecords: [
    { identifier: 'R', schema: SICREDI_CNAB240_SEGMENT_R },
    { identifier: 'S', schema: SICREDI_CNAB240_SEGMENT_S_FRONT_BACK },
    { identifier: 'Y01', schema: SICREDI_CNAB240_SEGMENT_Y01 },
    { identifier: 'Y04', schema: SICREDI_CNAB240_SEGMENT_Y04 },
  ],
}

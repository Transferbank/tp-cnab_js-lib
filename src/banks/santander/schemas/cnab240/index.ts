/**
 * Santander (033) — CNAB 240
 *
 * Estrutura modular seguindo o padrão do Bradesco.
 *
 * Fonte do layout:
 * - Manual "Layout Padrão 240 – Cobrança, Versão 2.5" (Setembro/2014)
 * - pycnab240, laravel-boleto, brcobranca, cnab_yaml
 */

import { BankSchema, BANK_CODES } from '../../../../types'
import { SANTANDER_CNAB240_FILE_HEADER } from './header'
import { SANTANDER_CNAB240_BATCH_HEADER } from './batch-header'
import { SANTANDER_CNAB240_SEGMENT_P } from './segment-p'
import { SANTANDER_CNAB240_SEGMENT_Q } from './segment-q'
import { SANTANDER_CNAB240_SEGMENT_R } from './segment-r'
import { SANTANDER_CNAB240_SEGMENT_S } from './segment-s'
import { SANTANDER_CNAB240_SEGMENT_Y03 } from './segment-y03'
import { SANTANDER_CNAB240_SEGMENT_Y53 } from './segment-y53'
import { SANTANDER_CNAB240_BATCH_TRAILER } from './batch-trailer'
import { SANTANDER_CNAB240_FILE_TRAILER } from './trailer'

export { SANTANDER_CNAB240_FILE_HEADER } from './header'
export { SANTANDER_CNAB240_BATCH_HEADER } from './batch-header'
export { SANTANDER_CNAB240_SEGMENT_P } from './segment-p'
export { SANTANDER_CNAB240_SEGMENT_Q } from './segment-q'
export { SANTANDER_CNAB240_SEGMENT_R } from './segment-r'
export {
  SANTANDER_CNAB240_SEGMENT_S,
  SANTANDER_CNAB240_SEGMENT_S_FORM,
  SANTANDER_CNAB240_SEGMENT_S_MESSAGES,
} from './segment-s'
export { SANTANDER_CNAB240_SEGMENT_Y03 } from './segment-y03'
export { SANTANDER_CNAB240_SEGMENT_Y53 } from './segment-y53'
export { resolveMaxAmount, resolveMinAmount, resolveY53Amount } from './segment-y53-helper'
export { SANTANDER_CNAB240_BATCH_TRAILER } from './batch-trailer'
export { SANTANDER_CNAB240_FILE_TRAILER } from './trailer'

export const santanderCnab240: BankSchema = {
  bankCode: BANK_CODES.SANTANDER,
  bankName: 'Santander',
  headerArquivo: SANTANDER_CNAB240_FILE_HEADER,
  headerLote: SANTANDER_CNAB240_BATCH_HEADER,
  segmentoP: SANTANDER_CNAB240_SEGMENT_P,
  segmentoQ: SANTANDER_CNAB240_SEGMENT_Q,
  trailerLote: SANTANDER_CNAB240_BATCH_TRAILER,
  trailerArquivo: SANTANDER_CNAB240_FILE_TRAILER,
  optionalRecords: [
    { identifier: 'R', schema: SANTANDER_CNAB240_SEGMENT_R },
    { identifier: 'S', schema: SANTANDER_CNAB240_SEGMENT_S },
    { identifier: 'Y03', schema: SANTANDER_CNAB240_SEGMENT_Y03 },
    { identifier: 'Y53', schema: SANTANDER_CNAB240_SEGMENT_Y53 },
  ],
}

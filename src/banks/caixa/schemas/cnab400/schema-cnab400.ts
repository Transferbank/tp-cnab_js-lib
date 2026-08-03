/**
 * Caixa Econômica Federal (104) — CNAB 400
 *
 * Usa sistema SIGCB, nosso número de 17 posições.
 *
 * Fonte do layout: laravel-boleto
 */

import { BankSchema, BANK_CODES } from '@/types/all-types'
import { HEADER } from './header'
import { DETAIL } from './detail'
import { TRAILER } from './trailer'
import { TYPE2_TITLE_MESSAGES, TYPE3_EMAIL_SMS, TYPE4_PAYMENT_ALLOCATION } from './registros-opcionais/optional-records'

export const caixaCnab400: BankSchema = {
  bankCode: BANK_CODES.CAIXA,
  bankName: 'Caixa Econômica',
  header: HEADER,
  detail: DETAIL,
  trailer: TRAILER,
  optionalRecords: [
    { identifier: '2', schema: TYPE2_TITLE_MESSAGES },
    { identifier: '3', schema: TYPE3_EMAIL_SMS },
    { identifier: '4', schema: TYPE4_PAYMENT_ALLOCATION },
  ],
}

export { HEADER, DETAIL, TRAILER }
export * from './registros-opcionais/optional-records'

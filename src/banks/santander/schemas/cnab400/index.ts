/**
 * Santander (033) — CNAB 400
 * Fonte: brcobranca, cnab_yaml, laravel-boleto (concordantes byte a byte)
 */

import { BankSchema, BANK_CODES } from '@tp-types/index'
import { HEADER } from './header'
import { DETAIL } from './detail'
import { TRAILER } from './trailer'
import { TYPE8_PIX } from './registros-opcionais'

export const santanderCnab400: BankSchema = {
  bankCode: BANK_CODES.SANTANDER,
  bankName: 'Santander',
  header: HEADER,
  detail: DETAIL,
  trailer: TRAILER,
  optionalRecords: [{ identifier: '8', schema: TYPE8_PIX }],
}

export { HEADER, DETAIL, TRAILER }
export * from './registros-opcionais'

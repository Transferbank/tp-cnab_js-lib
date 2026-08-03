/**
 * Sicoob / Bancoob (756) — CNAB 400
 * Cooperativa de crédito, nosso número 12 dígitos (com DV).
 * Fonte: Planilha oficial Sicoob (Layout_Cobranca_CNAB400.xls, mai/2025)
 */

import { BankSchema, BANK_CODES } from '@/types/all-types'
import { HEADER } from './header'
import { DETAIL } from './detail'
import { TRAILER } from './trailer'

export const sicoobCnab400: BankSchema = {
  bankCode: BANK_CODES.SICOOB,
  bankName: 'Sicoob',
  header: HEADER,
  detail: DETAIL,
  trailer: TRAILER,
}

export { HEADER, DETAIL, TRAILER }

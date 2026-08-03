/**
 * Itaú (341) — CNAB 400
 * 
 * Registros opcionais disponíveis:
 * - TIPO 2: Complemento de multa
 * - TIPO 4: Rateio de crédito
 * - TIPO 5: E-mail sacador/avalista
 * - TIPO 6: Emissão de boleto (4 layouts)
 * 
 * Ver: ./registros-opcionais/
 * Fonte: Manual oficial Itaú (layout_cobranca_400bytes_cnab_itau.pdf)
 */

import { BankSchema, BANK_CODES } from '@/types/all-types'
import { HEADER } from './header'
import { DETAIL } from './detail'
import { TRAILER } from './trailer'
import {
  TYPE2_FINE,
  TYPE4_CREDIT_ALLOCATION,
  TYPE5_EMAIL_ENDORSER,
  TYPE6_LAYOUT1_TITLE,
  TYPE6_LAYOUT2_INSTRUCTIONS_1_5,
  TYPE6_LAYOUT3_INSTRUCTIONS_6_9,
  TYPE6_LAYOUT4_ENDORSER,
} from './registros-opcionais/optional-records'

export const itauCnab400: BankSchema = {
  bankCode: BANK_CODES.ITAU,
  bankName: 'Itaú',
  header: HEADER,
  detail: DETAIL,
  trailer: TRAILER,
  optionalRecords: [
    { identifier: '2', schema: TYPE2_FINE },
    { identifier: '4', schema: TYPE4_CREDIT_ALLOCATION },
    { identifier: '5', schema: TYPE5_EMAIL_ENDORSER },
    { identifier: '6-1', schema: TYPE6_LAYOUT1_TITLE },
    { identifier: '6-2', schema: TYPE6_LAYOUT2_INSTRUCTIONS_1_5 },
    { identifier: '6-3', schema: TYPE6_LAYOUT3_INSTRUCTIONS_6_9 },
    { identifier: '6-4', schema: TYPE6_LAYOUT4_ENDORSER },
  ],
}

export { HEADER, DETAIL, TRAILER }
export * from './registros-opcionais/optional-records'

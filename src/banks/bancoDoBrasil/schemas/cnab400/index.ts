/**
 * Banco do Brasil (001) — CNAB 400
 *
 * PARTICULARIDADE: tipo_registro do detalhe é '7' (não '1' como padrão FEBRABAN)
 *
 * Registros opcionais:
 * - TIPO 5-99: Multa | TIPO 5-07: Descontos | TIPO 5-08: Consulta serasa
 *
 * Fonte: Manual oficial BB remessa (Doc2627CBR641Pos7.pdf, abril/2012)
 */

import { BankSchema, BANK_CODES } from '@tp-types/index'
import { HEADER } from './header'
import { DETAIL } from './detail'
import { TRAILER } from './trailer'
import { TYPE5_FINE, TYPE5_DISCOUNTS, TYPE5_CREDIT_BUREAU } from './registros-opcionais'

export { HEADER } from './header'
export { DETAIL } from './detail'
export { TRAILER } from './trailer'

// Registros opcionais
export * from './registros-opcionais'

export const bancoDoBrasilCnab400: BankSchema = {
  bankCode: BANK_CODES.BANCO_DO_BRASIL,
  bankName: 'Banco do Brasil',
  header: HEADER,
  detail: DETAIL,
  trailer: TRAILER,
  optionalRecords: [
    { identifier: '5-99', schema: TYPE5_FINE },
    { identifier: '5-07', schema: TYPE5_DISCOUNTS },
    { identifier: '5-08', schema: TYPE5_CREDIT_BUREAU },
  ],
}

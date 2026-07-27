/**
 * Santander (033) — CNAB 400
 *
 * Estrutura de um arquivo CNAB 400 (cada linha tem exatamente 400 caracteres):
 * - HEADER (primeira linha, tipo_registro = '0')
 * - DETALHE (linhas intermediárias, tipo_registro = '1')
 * - TRAILER (última linha, tipo_registro = '9')
 *
 * Fontes do layout:
 * - brcobranca (Ruby)
 * - cnab_yaml (YAML)
 * - laravel-boleto (PHP)
 *
 * Todas as três fontes concordam byte a byte em toda a remessa.
 * Confirmado contra arquivo real de 130 linhas (1 header + 128 detalhes + 1 trailer).
 *
 */

import { BankSchema, BANK_CODES } from '../../../../types'
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

/**
 * Banco do Brasil (001) — CNAB 400
 *
 * Estrutura de um arquivo CNAB 400 (cada linha tem exatamente 400 caracteres):
 * - HEADER (primeira linha, tipo_registro = '0')
 * - DETALHE (linhas intermediárias, tipo_registro = '7' - não '1' como padrão FEBRABAN)
 * - TRAILER (última linha, tipo_registro = '9')
 *
 * PARTICULARIDADE DO BB: tipo_registro do detalhe é '7' (não '1' como nos outros bancos)
 *
 * Registros opcionais de remessa:
 * - TIPO 5 / serviço '99': Multa (implementado)
 * - TIPO 5 / serviço '01': E-mail do sacado (não implementado)
 * - TIPO 5 / serviço '03': "Seu número" com 15 posições (não implementado)
 *
 * Fontes do layout:
 * - Manual oficial BB remessa (Doc2627CBR641Pos7.pdf, abril/2012)
 * - Manual oficial BB retorno (Doc2628CBR643Pos7.pdf, jan/2014)
 * - brcobranca (Ruby)
 * - cnab_yaml (YAML)
 * - laravel-boleto (PHP)
 *
 * Todas as fontes concordam byte a byte em toda a remessa e retorno.
 */

import { BankSchema, BANK_CODES } from '../../../../types'
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

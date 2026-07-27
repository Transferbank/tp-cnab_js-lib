/**
 * Itaú (341) — CNAB 400
 *
 * Estrutura de um arquivo CNAB 400 (cada linha tem exatamente 400 caracteres):
 * - HEADER (primeira linha, tipo_registro = '0')
 * - DETALHE (linhas intermediárias, tipo_registro = '1')
 * - TRAILER (última linha, tipo_registro = '9')
 *
 * Registros opcionais (não incluídos no BankSchema padrão):
 * - TIPO 2: Complemento de multa (após cada detalhe tipo 1)
 * - TIPO 4: Rateio de crédito (não implementado)
 * - TIPO 5: E-mail sacador/avalista (não implementado)
 * - TIPO 6: Emissão de boleto (não implementado)
 *
 * Ver: ./registros-opcionais/ para schemas dos tipos opcionais
 *
 * Fontes do layout:
 * - Manual oficial Itaú (layout_cobranca_400bytes_cnab_itau.pdf)
 * - brcobranca (Ruby)
 * - laravel-boleto (PHP)
 */

import { BankSchema, BANK_CODES } from '../../../../types'
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
} from './registros-opcionais'

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

// Registros opcionais (não fazem parte do BankSchema padrão)
// Importar diretamente quando necessário:
// import { TIPO2_MULTA } from './registros-opcionais'
export * from './registros-opcionais'

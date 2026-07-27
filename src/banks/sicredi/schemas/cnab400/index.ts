/**
 * Sicredi (748) — CNAB 400
 *
 * Estrutura de um arquivo CNAB 400 (cada linha tem exatamente 400 caracteres):
 * - HEADER (primeira linha, tipo_registro = '0')
 * - DETALHE (linhas intermediárias, tipo_registro = '1')
 * - TRAILER (última linha, tipo_registro = '9')
 *
 * Particularidades do Sicredi:
 * - Header usa "código do cliente/cedente" (5 dígitos) em vez de agência+conta.
 * - Datas de geração/instrução/início de juros/multa usam AAAAMMDD (8 dígitos);
 *   vencimento/emissão/desconto usam DDMMAA (6 dígitos) — dois formatos no mesmo layout.
 * - "Beneficiário Final" (não "Sacador/Avalista") — nomenclatura BACEN 3598/3656/3956.
 *
 * Registros opcionais de remessa (ver ./registros-opcionais):
 * - TIPO 2: Mensagem (texto livre)
 * - TIPO 5: Informativo (dados adicionais)
 * - TIPO 6: Beneficiário Final (obrigatório se houver Beneficiário Final)
 * - TIPO 7: Descontos 2 e 3
 * - TIPO 8: Híbrido/QR Code (obrigatório se boleto híbrido)
 *
 * Fontes do layout:
 * - Manual oficial Sicredi CNAB 400 (2026_03_12_manual_cnab_400_30.pdf, v3.0, fev/2026)
 * - laravel-boleto (PHP) — confirma header/detalhe/trailer/tipo2, não implementa tipo 5/6/7/8
 *
 */

import { BankSchema, BANK_CODES } from '../../../../types'
import { HEADER } from './header'
import { DETAIL } from './detail'
import { TRAILER } from './trailer'
import {
  TYPE2_MESSAGE,
  TYPE5_INFORMATIVE,
  TYPE6_ENDORSER,
  TYPE7_DISCOUNTS,
  TYPE8_HYBRID,
} from './registros-opcionais'

export { HEADER } from './header'
export { DETAIL } from './detail'
export { TRAILER } from './trailer'

// Registros opcionais
export * from './registros-opcionais'

export const sicrediCnab400: BankSchema = {
  bankCode: BANK_CODES.SICREDI,
  bankName: 'Sicredi',
  header: HEADER,
  detail: DETAIL,
  trailer: TRAILER,
  optionalRecords: [
    { identifier: '2', schema: TYPE2_MESSAGE },
    { identifier: '5', schema: TYPE5_INFORMATIVE },
    { identifier: '6', schema: TYPE6_ENDORSER },
    { identifier: '7', schema: TYPE7_DISCOUNTS },
    { identifier: '8', schema: TYPE8_HYBRID },
  ],
}

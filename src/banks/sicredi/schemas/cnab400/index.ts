/**
 * Sicredi (748) — CNAB 400
 *
 * Particularidades do Sicredi:
 * - Header usa "código do cliente/cedente" (5 dígitos) em vez de agência+conta
 * - Dois formatos de data: AAAAMMDD (geração/instrução/juros/multa) e DDMMAA (vencimento/emissão/desconto)
 * - "Beneficiário Final" (nomenclatura BACEN 3598/3656/3956), não "Sacador/Avalista"
 *
 * Registros opcionais:
 * - TIPO 2: Mensagem | TIPO 5: Informativo | TIPO 6: Beneficiário Final
 * - TIPO 7: Descontos 2 e 3 | TIPO 8: Híbrido/QR Code
 *
 * Fonte: Manual oficial Sicredi CNAB 400 (2026_03_12_manual_cnab_400_30.pdf, v3.0, fev/2026)
 */

import { BankSchema, BANK_CODES } from '@tp-types/index'
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

/**
 * Bradesco (237) — CNAB 400
 *
 * Banco mais comum no Brasil, código cedente de 20 posições, nosso número 11+1.
 *
 * IMPORTANTE: Este schema exporta apenas o conjunto básico para REMESSA.
 * Retorno não é coberto no momento (apenas o header de retorno está disponível
 * para uso direto).
 *
 * Estrutura do arquivo CNAB 400:
 * - Header (tipo 0): Primeira linha, identificação do arquivo
 * - Details (tipo 1): Linhas com dados dos títulos
 * - Trailer (tipo 9): Última linha, fechamento do arquivo
 *
 * Fonte do layout:
 * - Manual "Layout de Cobrança CNAB 400 — versão em português" (27/07/2017)
 * - brcobranca, cnab_yaml, laravel-boleto
 */

import { BankSchema, BANK_CODES } from '@tp-types/index'
import { BRADESCO_CNAB400_HEADER_REMESSA } from './header'
import { BRADESCO_CNAB400_DETAIL } from './detail'
import { BRADESCO_CNAB400_TRAILER } from './trailer'
import { TYPE2_MESSAGES_DISCOUNTS, TYPE6_PORTFOLIO_TRANSFER } from './registros-opcionais'

export {
  BRADESCO_CNAB400_HEADER_REMESSA,
  BRADESCO_CNAB400_HEADER_RETORNO,
} from './header'

export { BRADESCO_CNAB400_DETAIL } from './detail'
export { BRADESCO_CNAB400_TRAILER } from './trailer'

// Registros opcionais
export * from './registros-opcionais'

export const bradescoCnab400: BankSchema = {
  bankCode: BANK_CODES.BRADESCO,
  bankName: 'Bradesco',
  header: BRADESCO_CNAB400_HEADER_REMESSA,
  detail: BRADESCO_CNAB400_DETAIL,
  trailer: BRADESCO_CNAB400_TRAILER,
  optionalRecords: [
    { identifier: '2', schema: TYPE2_MESSAGES_DISCOUNTS },
    { identifier: '6', schema: TYPE6_PORTFOLIO_TRANSFER },
  ],
}

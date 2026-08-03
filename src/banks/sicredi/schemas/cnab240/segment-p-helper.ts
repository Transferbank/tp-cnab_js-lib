/**
 * Helper para resolver o campo condicional valor_titulo do Segmento P (Sicredi CNAB 240)
 *
 * O valor do título (posições 086-100) tem precisão decimal condicional ao código
 * da moeda (posições 228-229): "Quando o valor do título for expresso em moeda
 * corrente, utilizar 2 decimais. Quando expresso em moeda variável, utilizar 5
 * decimais."
 *
 * - '09' (Real) = moeda corrente → 2 decimais
 * - qualquer outro código = moeda variável → 5 decimais
 *
 * O schema (`segment-p.ts`) declara `decimais: 2` fixo (correto apenas para moeda
 * corrente). Este helper recalcula o valor real com a precisão correta baseada no
 * código da moeda, mesmo padrão já usado em `segmento-y53-helper.ts` (Santander).
 *
 * Baseado em: Manual oficial Sicredi CNAB 240, versão 29 (seção 8, Segmento P)
 */

import { ParsedLine } from '@/types/all-types'

/**
 * Resolve o valor real do título a partir dos dígitos brutos e do código da moeda.
 *
 * @param rawDigits - String de dígitos brutos do campo `valor_titulo` (15 caracteres)
 * @param moedaCodigo - Código da moeda (posições 228-229): '09' = Real (2 decimais), outro = moeda variável (5 decimais)
 * @returns Valor numérico com a precisão correta aplicada
 *
 * @example
 * // Moeda corrente (Real): "000000000036812" → 368.12 (2 decimais)
 * resolveTitleAmount('000000000036812', '09') // 368.12
 *
 * @example
 * // Moeda variável: "000000001234567" → 12.34567 (5 decimais)
 * resolveTitleAmount('000000001234567', '05') // 12.34567
 */
export function resolveTitleAmount(rawDigits: string, moedaCodigo: string): number {
  const parsedValue = parseInt(rawDigits.trim(), 10)
  // rawDigits pode vir em branco (campo condicional não preenchido) ou com lixo se o
  // registro estiver corrompido; checkFieldFormat já reporta isso via ParsedField.error,
  // então aqui o fallback para 0 é intencional (não é um "parseou pra zero" legítimo).
  const intValue = Number.isNaN(parsedValue) ? 0 : parsedValue
  const decimais = moedaCodigo.trim() === '09' ? 2 : 5
  return intValue / Math.pow(10, decimais)
}

/**
 * Resolve o valor do título do Segmento P com a precisão correta.
 *
 * @param fields - Linha parseada contendo os campos do segmento (`valor_titulo` e `moeda_codigo`)
 * @returns Valor do título com decimais corretos conforme o código da moeda
 *
 * @example
 * const fields = extractLineFields(linha, SICREDI_CNAB240_SEGMENT_P)
 * const valor = resolveTitleAmountSegmentP(fields)
 */
export function resolveTitleAmountSegmentP(fields: ParsedLine): number {
  const moedaCodigo = fields.moeda_codigo?.raw ?? '09'
  return resolveTitleAmount(fields.valor_titulo.raw, String(moedaCodigo))
}

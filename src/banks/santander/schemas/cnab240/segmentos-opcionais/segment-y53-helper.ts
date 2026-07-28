/**
 * Helper para resolver campos condicionais do Segmento Y-53 (Santander CNAB 240)
 * 
 * Os campos `valor_maximo` e `valor_minimo` têm precisão decimal condicional
 * baseada nos campos de tipo que os precedem (Nota 48 do manual H7815 v6):
 * 
 * - Tipo '1' = % (percentual) → 10 dígitos inteiros + 5 decimais (N010V99999)
 * - Tipo '2' = valor monetário → 13 dígitos inteiros + 2 decimais (N013V99)
 * 
 * O schema (`segment-y53.ts`) declara `decimais: 2` fixo (correto apenas para tipo '2').
 * Este helper recalcula o valor real com a precisão correta baseada no tipo.
 * 
 * Baseado em: Manual H7815 v6 (Fevereiro/2023), Nota 48
 */

import { ParsedLine } from '@tp-types/index'

/**
 * Resolve o valor real de um campo condicional do Segmento Y-53.
 * 
 * @param rawDigits - String de dígitos brutos do campo (15 caracteres)
 * @param tipo - Tipo de valor: '1' = percentual (5 decimais), '2' = valor (2 decimais)
 * @returns Valor numérico com a precisão correta aplicada
 * 
 * @example
 * // Tipo '1' (percentual): "000000001234567" → 12.34567 (5 decimais)
 * resolveY53Amount("000000001234567", "1") // 12.34567
 * 
 * @example
 * // Tipo '2' (valor): "000000001234567" → 12345.67 (2 decimais)
 * resolveY53Amount("000000001234567", "2") // 12345.67
 */
export function resolveY53Amount(rawDigits: string, tipo: string): number {
  const intValue = parseInt(rawDigits.trim(), 10) || 0
  const decimais = tipo === '1' ? 5 : 2
  return intValue / Math.pow(10, decimais)
}

/**
 * Resolve o valor máximo do Segmento Y-53 com a precisão correta.
 * 
 * @param fields - Linha parseada contendo os campos do segmento
 * @returns Valor máximo com decimais corretos (5 se tipo=1, 2 se tipo=2)
 * 
 * @example
 * const fields = parseSegmentoY53(linha)
 * const valorMax = resolveMaxAmount(fields)
 */
export function resolveMaxAmount(fields: ParsedLine): number {
  return resolveY53Amount(fields.valor_maximo.raw, String(fields.valor_maximo_tipo.value))
}

/**
 * Resolve o valor mínimo do Segmento Y-53 com a precisão correta.
 * 
 * @param fields - Linha parseada contendo os campos do segmento
 * @returns Valor mínimo com decimais corretos (5 se tipo=1, 2 se tipo=2)
 * 
 * @example
 * const fields = parseSegmentoY53(linha)
 * const valorMin = resolveMinAmount(fields)
 */
export function resolveMinAmount(fields: ParsedLine): number {
  return resolveY53Amount(fields.valor_minimo.raw, String(fields.valor_minimo_tipo.value))
}

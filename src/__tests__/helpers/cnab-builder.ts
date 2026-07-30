/**
 * Helpers para construção de linhas CNAB em testes
 *
 * Fornece funções para montar linhas CNAB 240 e CNAB 400 a partir de schemas,
 * facilitando a criação de arquivos de teste.
 */

import { RecordSchema, FieldDefinition } from '@tp-types/index'

/**
 * Função genérica para construir uma linha CNAB com tamanho especificado
 */
function buildCnabLine(
  schema: RecordSchema,
  values: Record<string, string>,
  lineLength: number
): string {
  const chars = new Array(lineLength).fill(' ')

  for (const [field, def] of Object.entries(schema) as [string, FieldDefinition][]) {
    const value = values[field] ?? (typeof def.pattern === 'string' ? def.pattern : '')
    const [start, end] = def.pos
    const fieldLen = end - start + 1
    const formatted =
      def.type === 'num'
        ? value.padStart(fieldLen, '0').slice(-fieldLen)
        : value.padEnd(fieldLen, ' ').slice(0, fieldLen)

    for (let i = 0; i < fieldLen; i++) {
      chars[start - 1 + i] = formatted[i]
    }
  }

  return chars.join('')
}

/**
 * Constrói uma linha CNAB 400 (400 caracteres) a partir de um schema
 *
 * @param schema - Schema do registro (header, detail, trailer)
 * @param values - Valores dos campos a serem preenchidos
 * @returns Linha CNAB 400 formatada (400 caracteres)
 *
 * @example
 * ```typescript
 * const header = buildLine400(bradescoCnab400.header!, {
 *   codigo_cedente: 'CEDENTE0001',
 *   nome_empresa: 'EMPRESA EXEMPLO'
 * })
 * ```
 */
export function buildLine400(
  schema: RecordSchema,
  values: Record<string, string>
): string {
  return buildCnabLine(schema, values, 400)
}

/**
 * Constrói uma linha CNAB 240 (240 caracteres) a partir de um schema
 *
 * @param schema - Schema do registro (headerArquivo, segmentoP, segmentoQ, trailerArquivo)
 * @param values - Valores dos campos a serem preenchidos
 * @returns Linha CNAB 240 formatada (240 caracteres)
 *
 * @example
 * ```typescript
 * const header = buildLine240(santanderCnab240.headerArquivo!, {
 *   cedente_nome: 'EMPRESA TESTE',
 *   arquivo_data_de_geracao: '01072026'
 * })
 * ```
 */
export function buildLine240(
  schema: RecordSchema,
  values: Record<string, string>
): string {
  return buildCnabLine(schema, values, 240)
}

/**
 * Alias para buildLine400 (retrocompatibilidade)
 * @deprecated Use buildLine400 explicitamente
 */
export const buildLine = buildLine400

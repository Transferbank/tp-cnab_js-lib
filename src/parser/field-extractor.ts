/**
 * Extrator de campos CNAB
 * 
 * Responsável por extrair valores de uma linha CNAB por posição e
 * verificar se o formato está correto (numérico contém só dígitos, etc).
 */

import { FieldDefinition, RecordSchema } from '../types'
import { ParsedLine, ParsedField } from '../types/core'

/**
 * Extrai o valor bruto (sem nenhum trim ou conversão) de um campo a partir de uma linha.
 *
 * @param line - linha completa do arquivo CNAB (já deve ter o tamanho esperado — 240/400 —
 *   quem chama é responsável por validar isso antes)
 * @param start - posição inicial do campo, 1-indexada e inclusiva (igual ao manual FEBRABAN / `FieldDefinition.pos[0]`)
 * @param end - posição final do campo, 1-indexada e inclusiva (`FieldDefinition.pos[1]`)
 * @returns o trecho da linha correspondente à posição, exatamente como está no arquivo
 */
function getFieldRaw(line: string, start: number, end: number): string {
  return line.substring(start - 1, end)
}

/**
 * Converte o valor bruto (string) para o tipo correto com base em `fieldDef.type`.
 *
 * @param rawValue - valor ainda não tratado, obtido via {@link getFieldRaw}
 * @param fieldDef - definição do campo no schema; usa `type` para decidir a conversão e
 *   `decimals` (só quando `type === 'num'`) para posicionar a vírgula implícita
 * @returns `number` para campos `'num'` (já convertidos por `decimals`); `string` para
 *   `'alfa'` (trim só à direita, preserva espaços à esquerda) e `'data'` (trim dos dois lados,
 *   permanece texto — não vira `Date` aqui)
 */
function getFieldValue(rawValue: string, fieldDef: FieldDefinition): string | number {
  const { type: fieldType, decimals: decimalPlaces = 0 } = fieldDef

  if (fieldType === 'num') {
    // Campo em branco (só espaços) vira 0 em vez de NaN — CNAB usa espaço como "vazio" em campos numéricos opcionais.
    const cleaned = rawValue.replace(/\s/g, '') || '0'
    const numVal = parseInt(cleaned, 10) || 0
    // decimalPlaces > 0: o CNAB não grava ponto decimal, então "000015000" com decimalPlaces=2 vira 150.00
    return decimalPlaces > 0 ? numVal / Math.pow(10, decimalPlaces) : numVal
  }

  if (fieldType === 'data') {
    return rawValue.trim()
  }

  // fieldType 'alfa' — remove espaços em branco à direita (preenchimento padrão CNAB), mantém à esquerda
  return rawValue.trimEnd()
}

/**
 * Checa se o valor bruto de um campo está de acordo com as regras do schema.
 * Não faz conversão de tipo — isso é papel de {@link getFieldValue}.
 *
 * Ordem de checagem (a primeira falha encontrada é a retornada):
 * 1. valor fixo esperado (`pattern`) — só é verificado quando `required: true` (ver nota em `FieldDefinition.pattern`)
 * 2. campo obrigatório vazio (sem `pattern`, ou com `pattern` mas passou na checagem acima)
 * 3. campo numérico com caracteres não-dígito
 *
 * @param rawValue - valor ainda não tratado, obtido via {@link getFieldRaw}
 * @param fieldDef - definição do campo no schema (usa `type`, `required`, `pattern`)
 * @returns `null` se o campo está ok, ou uma mensagem descrevendo o problema (vira `ParsedField.error`)
 */
function checkFieldFormat(rawValue: string, fieldDef: FieldDefinition): string | null {
  const { type: fieldType, required: isRequired, pattern: expectedPattern } = fieldDef

  // Verificar valor fixo esperado — só para campos obrigatórios (expectedPattern em campo opcional não é imposto)
  if (expectedPattern !== undefined && expectedPattern !== null && isRequired) {
    const actual = rawValue.trim()
    if (actual && actual !== String(expectedPattern)) {
      return `Esperado "${expectedPattern}", encontrado "${actual}"`
    }
    if (!actual) {
      return `Campo obrigatório vazio, esperado "${expectedPattern}"`
    }
  }

  // Verificar campo obrigatório vazio
  if (isRequired && (!rawValue || !rawValue.trim())) {
    return 'Campo obrigatório não preenchido'
  }

  // Verificar que campos numéricos contêm apenas dígitos (espaços já foram tratados como "vazio" acima)
  if (fieldType === 'num' && rawValue.trim()) {
    if (!/^\d+$/.test(rawValue.trim())) {
      return `Campo numérico contém caracteres inválidos: "${rawValue.trim()}"`
    }
  }

  return null
}

/**
 * Extrai e valida todos os campos de uma linha CNAB usando o schema de um registro
 * (ex: `bankSchema.header`, `bankSchema.segmentoP`).
 *
 * @param line - linha completa do arquivo, já no tamanho esperado (240/400 chars)
 * @param schema - mapa nome-do-campo → `FieldDefinition` (ver contrato de nomes em `RecordSchema`)
 * @returns objeto indexado pelo mesmo nome de campo do schema, onde cada valor é um
 *   `ParsedField` contendo `raw`/`value`/`error` MAIS todas as propriedades originais
 *   da `FieldDefinition` espalhadas (`...fieldDef`) — permite ler `parsed.campo.description`
 *   ou `parsed.campo.type` sem precisar consultar o schema de novo
 */
export function extractLineFields(line: string, schema: RecordSchema): ParsedLine {
  const result: ParsedLine = {}

  for (const [fieldName, fieldDef] of Object.entries(schema)) {
    const [start, end] = fieldDef.pos
    const rawValue = getFieldRaw(line, start, end)
    const error = checkFieldFormat(rawValue, fieldDef)

    result[fieldName] = {
      raw: rawValue,
      value: getFieldValue(rawValue, fieldDef),
      error,
      ...fieldDef,
    } as ParsedField
  }

  return result
}

/**
 * Encontra o valor esperado (`pattern`) do campo que representa o tipo de registro
 * dentro de um RecordSchema, localizando-o pela POSIÇÃO inicial (`pos[0]`), não pelo
 * nome do campo — o nome varia entre bancos (`tipo_registro`, `codigo_registro`,
 * `controle_registro`...), mas a posição é sempre fixa por formato: CNAB 400 usa
 * posição 1, CNAB 240 usa posição 8.
 * 
 * @param schema - Schema do registro (ex: bankSchema.header, bankSchema.trailerArquivo)
 * @param position - Posição esperada do campo de tipo: 1 para CNAB 400, 8 para CNAB 240
 * @returns O valor esperado do pattern, ou null se não encontrado
 * 
 * @example
 * ```typescript
 * // CNAB 400 - encontra campo na posição 1 (independente do nome)
 * const headerType = getRecordTypePattern(bankSchema.header, 1) || '0'
 * 
 * // CNAB 240 - encontra campo na posição 8 (independente do nome)
 * const trailerType = getRecordTypePattern(bankSchema.trailerArquivo, 8) || '9'
 * ```
 */
export function getRecordTypePattern(
  schema: RecordSchema | undefined,
  position: 1 | 8
): string | number | null {
  if (!schema) return null
  const field = Object.values(schema).find(f => f.pos[0] === position)
  return field?.pattern ?? null
}

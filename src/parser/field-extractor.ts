import { FieldDefinition, RecordSchema, FieldType } from '@tp-types/index'
import { ParsedLine, ParsedField } from '@tp-types/core'

/**
 * Extrai valor bruto de campo por posição (1-indexed, inclusiva, conforme manual FEBRABAN).
 */
function getFieldRaw(line: string, start: number, end: number): string {
  return line.substring(start - 1, end)
}

/**
 * Converte valor bruto para tipo correto.
 * NUM: aplica `decimals` (vírgula implícita CNAB - "000015000" com decimals=2 → 150.00)
 * ALFA: trimEnd (preserva espaços à esquerda)
 * DATA: trim (permanece string, não vira Date aqui)
 */
function getFieldValue(rawValue: string, fieldDef: FieldDefinition): string | number {
  const { type: fieldType, decimals: decimalPlaces = 0 } = fieldDef

  if (fieldType === FieldType.NUM) {
    const cleaned = rawValue.replace(/\s/g, '') || '0'  // CNAB usa espaço como "vazio"
    const numVal = parseInt(cleaned, 10) || 0
    return decimalPlaces > 0 ? numVal / Math.pow(10, decimalPlaces) : numVal
  }

  if (fieldType === FieldType.DATA) {
    return rawValue.trim()
  }

  return rawValue.trimEnd()
}

function checkFieldFormat(rawValue: string, fieldDef: FieldDefinition): string | null {
  const { type: fieldType, required: isRequired, pattern: expectedPattern } = fieldDef

  if (expectedPattern !== undefined && expectedPattern !== null && isRequired) {
    const actual = rawValue.trim()
    if (actual && actual !== String(expectedPattern)) {
      return `Esperado "${expectedPattern}", encontrado "${actual}"`
    }
    if (!actual) {
      return `Campo obrigatório vazio, esperado "${expectedPattern}"`
    }
  }

  if (isRequired && (!rawValue || !rawValue.trim())) {
    return 'Campo obrigatório não preenchido'
  }

  if (fieldType === FieldType.NUM && rawValue.trim()) {
    if (!/^\d+$/.test(rawValue.trim())) {
      return `Campo numérico contém caracteres inválidos: "${rawValue.trim()}"`
    }
  }

  return null
}

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
 * Busca pattern do campo tipo_registro por POSIÇÃO (não por nome, que varia entre bancos).
 * CNAB 400: posição 1 | CNAB 240: posição 8
 */
export function getRecordTypePattern(
  schema: RecordSchema | undefined,
  position: 1 | 8
): string | number | null {
  if (!schema) return null
  const field = Object.values(schema).find(f => f.pos[0] === position)
  return field?.pattern ?? null
}

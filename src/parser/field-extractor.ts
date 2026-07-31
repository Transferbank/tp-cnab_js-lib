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
    const parsedNum = parseInt(cleaned, 10)
    // `cleaned` pode conter caracteres não numéricos se o campo estiver corrompido;
    // checkFieldFormat já reporta esse erro separadamente em ParsedField.error,
    // então aqui o fallback para 0 é intencional (não é um "parseou pra zero" legítimo).
    const numVal = Number.isNaN(parsedNum) ? 0 : parsedNum
    return decimalPlaces > 0 ? numVal / Math.pow(10, decimalPlaces) : numVal
  }

  if (fieldType === FieldType.DATA) {
    return rawValue.trim()
  }

  return rawValue.trimEnd()
}

function checkFieldFormat(rawValue: string, fieldDef: FieldDefinition): string | null {
  const { type: fieldType, required: isRequired, pattern: expectedPattern } = fieldDef
  const trimmedValue = rawValue.trim()

  if (expectedPattern != null && isRequired) {
    const patternMatches = trimmedValue === String(expectedPattern)
    
    if (trimmedValue.length > 0 && !patternMatches) {
      return `Esperado "${expectedPattern}", encontrado "${trimmedValue}"`
    }
    if (trimmedValue.length === 0) {
      return `Campo obrigatório vazio, esperado "${expectedPattern}"`
    }
  }

  if (isRequired && (rawValue == null || trimmedValue.length === 0)) {
    return 'Campo obrigatório não preenchido'
  }

  if (fieldType === FieldType.NUM && trimmedValue.length > 0) {
    if (!/^\d+$/.test(trimmedValue)) {
      return `Campo numérico contém caracteres inválidos: "${trimmedValue}"`
    }
  }

  return null
}

export function extractLineFields(line: string, schema: RecordSchema): ParsedLine {
  const result: ParsedLine = {}
  const schemaEntries = Object.entries(schema)

  for (const [fieldName, fieldDef] of schemaEntries) {
    const [start, end] = fieldDef.pos
    const rawValue = getFieldRaw(line, start, end)
    const error = checkFieldFormat(rawValue, fieldDef)

    result[fieldName] = {
      raw: rawValue,
      value: getFieldValue(rawValue, fieldDef),
      error,
      canonical: fieldDef.canonical,
      pos: fieldDef.pos,
      type: fieldDef.type,
      size: fieldDef.size,
      decimals: fieldDef.decimals,
      required: fieldDef.required,
      dateFormat: fieldDef.dateFormat,
      pattern: fieldDef.pattern,
      description: fieldDef.description,
    } as ParsedField
  }

  return result
}

/**
 * Busca pattern do campo tipo_registro por POSIÇÃO (não por nome, que varia entre bancos).
 * CNAB 400: posição 1 | CNAB 240: posição 8
 * 
 * Note: Similar a getFieldByPosition (group-lines.ts), mas opera em
 * RecordSchema (definição) vs ParsedLine (dados).
 */
export function getRecordTypePattern(
  schema: RecordSchema | undefined,
  position: 1 | 8
): string | number | null {
  if (schema == null) return null
  
  const field = Object.values(schema).find(f => f.pos[0] === position)
  return field?.pattern ?? null
}

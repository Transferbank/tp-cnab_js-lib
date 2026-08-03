
import { RecordSchema, FieldDefinition } from '@tp-types/index'


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


export function buildLine400(
  schema: RecordSchema,
  values: Record<string, string>
): string {
  return buildCnabLine(schema, values, 400)
}

export function buildLine240(
  schema: RecordSchema,
  values: Record<string, string>
): string {
  return buildCnabLine(schema, values, 240)
}

import { extractLineFields } from '@parser/field-extractor'
import { RecordSchema, ValidationError } from '@/types/all-types'
import { collectFieldErrors } from '@validators/collect-field-errors'

export function validateHeader(headerLine: string, headerSchema: RecordSchema | undefined): ValidationError[] {
  if (!headerSchema) {
    return []
  }

  const parsedHeader = extractLineFields(headerLine, headerSchema)
  return collectFieldErrors(parsedHeader, 1)
}

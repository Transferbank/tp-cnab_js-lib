import { extractLineFields } from '@parser/field-extractor'
import { RecordSchema, ValidationError } from '@tp-types/index'

export function validateHeader(headerLine: string, headerSchema: RecordSchema | undefined): ValidationError[] {
  const errors: ValidationError[] = []

  if (headerSchema) {
    const parsedHeader = extractLineFields(headerLine, headerSchema)
    for (const [field, data] of Object.entries(parsedHeader)) {
      if (data.error) {
        errors.push({ 
          line: 1, 
          field: (data.descricao as string) || field, 
          message: data.error 
        })
      }
    }
  }

  return errors
}

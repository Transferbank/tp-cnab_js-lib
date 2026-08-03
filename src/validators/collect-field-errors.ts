import { ParsedLine, ValidationError } from '@/types/all-types'

export function collectFieldErrors(
  parsed: ParsedLine | null,
  lineNumber: number,
  fieldsWithError?: Set<string>
): ValidationError[] {
  const errors: ValidationError[] = []

  if (parsed) {
    for (const [field, data] of Object.entries(parsed)) {
      if (data.error) {
        errors.push({
          line: lineNumber,
          field: (data.descricao as string) || field,
          message: data.error,
        })
        if (fieldsWithError) {
          fieldsWithError.add(field)
        }
      }
    }
  }

  return errors
}

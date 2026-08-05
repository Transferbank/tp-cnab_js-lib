import { FieldValidator } from './field-validator'
import { validateDocument } from '@utils/string-utils'

export class DocumentValidator implements FieldValidator {
  readonly errorMessage = 'CPF ou CNPJ inválido'

  validate(raw: string): boolean {
    return validateDocument(raw)
  }
}

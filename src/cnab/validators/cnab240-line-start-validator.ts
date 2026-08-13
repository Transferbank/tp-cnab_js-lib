import { CnabLineValidator } from '@cnab/types/cnab-line-validator'
import { CnabValidationResult } from '@cnab/types/cnab-validation-result'
import { CnabValidationError } from '@cnab/types/cnab-validation-error'
import { CnabValidationErrorType } from '@cnab/types/cnab-validation-error-type'

export abstract class Cnab240LineStartValidator extends CnabLineValidator {
  static readonly expectedStart: string

  static shouldValidate(_rawLine: string): boolean {
    return true
  }

  validate(): CnabValidationResult {
    const expectedStart = (this.constructor as typeof Cnab240LineStartValidator).expectedStart
    const isValid = this.rawLine.startsWith(expectedStart)
    const errors: CnabValidationError[] = []

    if (!isValid) {
      errors.push({
        message: `Início de linha inválido: esperado "${expectedStart}"`,
        errorType: CnabValidationErrorType.LINE,
        lineNumber: this.lineNumber
      })
    }

    return {
      isValid,
      errors
    }
  }
}

export class Cnab240HeaderLineStartValidator extends Cnab240LineStartValidator {
  static readonly expectedStart = '0'
}

export class Cnab240TrailerLineStartValidator extends Cnab240LineStartValidator {
  static readonly expectedStart = '9'
}

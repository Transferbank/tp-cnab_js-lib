import { CnabLineValidator } from '@cnab/type/cnab-line-validator'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabValidationErrorType } from '@cnab/type/cnab-validation-error-type'

export abstract class Cnab240LineStartValidator extends CnabLineValidator {
  static readonly expectedStart: string

  static shouldValidate(_rawLine: string): boolean {
    return true
  }

  validate(): CnabValidationResult {
    const expectedStart = (this.constructor as typeof Cnab240LineStartValidator).expectedStart
    const isValid = this.rawLine.startsWith(expectedStart)
    return {
      isValid,
      errors: isValid ? [] : [{
        message: `Início de linha inválido: esperado "${expectedStart}"`,
        errorType: CnabValidationErrorType.LINE,
        lineNumber: this.lineNumber
      }]
    }
  }
}

export class Cnab240HeaderLineStartValidator extends Cnab240LineStartValidator {
  static readonly expectedStart = '0'
}

export class Cnab240TrailerLineStartValidator extends Cnab240LineStartValidator {
  static readonly expectedStart = '9'
}
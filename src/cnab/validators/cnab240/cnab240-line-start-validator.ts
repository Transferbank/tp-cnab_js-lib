import { CnabLineValidator } from '@cnab/type/cnab-line-validator'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabValidationErrorType } from '@cnab/type/cnab-validation-error'

export class Cnab240LineStartValidator extends CnabLineValidator {
  static readonly expectedStart: string

  shouldValidate(): boolean {
    return true
  }

  validate(): CnabValidationResult {
    const expectedStart = (this.constructor as typeof Cnab240LineStartValidator).expectedStart
    const isValid = this.rawLine.startsWith(expectedStart)
    const errors = []
    
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
import { CnabLineValidator } from '@cnab/type/cnab-line-validator'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabValidationErrorType } from '@cnab/type/cnab-validation-error'

export class CnabLineSizeValidator extends CnabLineValidator {
  static readonly expectedSize: number

  shouldValidate(): boolean {
    return true
  }

  validate(): CnabValidationResult {
    const actualSize = this.rawLine.length
    const expectedSize = (this.constructor as typeof CnabLineSizeValidator).expectedSize
    const isValid = actualSize === expectedSize
    const errors = []
    
    if (!isValid) {
      errors.push({
        message: `Tamanho de linha inválido: esperado ${expectedSize}, recebido ${actualSize}`,
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

export class Cnab240LineSizeValidator extends CnabLineSizeValidator {
  static readonly expectedSize = 240
}

export class Cnab400LineSizeValidator extends CnabLineSizeValidator {
  static readonly expectedSize = 400
}
import { CnabLineValidator } from '@cnab/type/cnab-line-validator'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabValidationError } from '@cnab/type/cnab-validation-error'
import { CnabValidationErrorType } from '@cnab/type/cnab-validation-error-type'

export abstract class CnabLineSizeValidator extends CnabLineValidator {
  static readonly expectedSize: number

  static shouldValidate(_rawLine: string): boolean {
    return true
  }

  validate(): CnabValidationResult {
    const actualSize = this.rawLine.length
    const expectedSize = (this.constructor as typeof CnabLineSizeValidator).expectedSize
    const isValid = actualSize === expectedSize
    const errors: CnabValidationError[] = []

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
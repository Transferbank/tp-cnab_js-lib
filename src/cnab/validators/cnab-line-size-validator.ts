import { CnabLineValidator } from '@cnab/type/cnab-line-validator'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabInvalidLineSizeError } from '@cnab/type/cnab-validation-error'

export class CnabLineSizeValidator extends CnabLineValidator {
  static readonly expectedSize: number

  static shouldValidate(_rawLine: string): boolean {
    return true
  }

  validate(): CnabValidationResult {
    const actualSize = this.rawLine.length
    const expectedSize = (this.constructor as typeof CnabLineSizeValidator)
      .expectedSize
    const isValid = actualSize === expectedSize
    const errors = []

    if (!isValid) {
      errors.push(
        new CnabInvalidLineSizeError({
          lineNumber: this.lineNumber,
          expectedSize,
          actualSize
        })
      )
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
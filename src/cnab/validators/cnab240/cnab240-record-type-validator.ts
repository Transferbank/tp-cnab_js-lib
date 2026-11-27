import { CnabLineValidator } from '@cnab/type/cnab-line-validator'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabInvalidRecordTypeError } from '@cnab/type/cnab-validation-error'

export class Cnab240RecordTypeValidator extends CnabLineValidator {
  static readonly expectedRecordType: string

  shouldValidate(): boolean {
    return true
  }

  validate(): CnabValidationResult {
    const { expectedRecordType } = this.constructor as typeof Cnab240RecordTypeValidator
    const actualRecordType = this.rawLine.substring(7, 8)

    if (actualRecordType == expectedRecordType) {
      return { isValid: true, errors: [] }
    }

    return {
      isValid: false,
      errors: [
        new CnabInvalidRecordTypeError({
          lineNumber: this.lineNumber,
          expectedRecordType,
          actualRecordType
        })
      ]
    }
  }
}

export class Cnab240HeaderRecordTypeValidator extends Cnab240RecordTypeValidator {
  static readonly expectedRecordType = '0'
}

export class Cnab240TrailerRecordTypeValidator extends Cnab240RecordTypeValidator {
  static readonly expectedRecordType = '9'
}

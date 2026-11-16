import { CnabLineValidator } from '@cnab/type/cnab-line-validator'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabInvalidRecordTypeError } from '@cnab/type/cnab-validation-error'

export class Cnab240RecordTypeValidator extends CnabLineValidator {
  static readonly expectedRecordTypes: string[]

  shouldValidate(): boolean {
    return this.rawLine.length >= 8
  }

  validate(): CnabValidationResult {
    const expectedRecordTypes = (this.constructor as typeof Cnab240RecordTypeValidator).expectedRecordTypes
    const recordType = this.rawLine.substring(7, 8)
    const isValid = expectedRecordTypes.includes(recordType)
    const errors = []

    if (!isValid) {
      errors.push(
        new CnabInvalidRecordTypeError({
          lineNumber: this.lineNumber,
          expectedRecordTypes,
          recordType
        })
      )
    }

    return {
      isValid,
      errors
    }
  }
}

export class Cnab240HeaderRecordTypeValidator extends Cnab240RecordTypeValidator {
  static readonly expectedRecordTypes = ['0']
}

export class Cnab240TrailerRecordTypeValidator extends Cnab240RecordTypeValidator {
  static readonly expectedRecordTypes = ['9']
}

export class Cnab240LoteRecordTypeValidator extends Cnab240RecordTypeValidator {
  static readonly expectedRecordTypes = ['1', '2', '3', '4', '5']
}

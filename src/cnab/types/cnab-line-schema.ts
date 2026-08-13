import { CnabFormat } from './cnab-format'
import { CnabBankCode } from './cnab-bank-code'
import { CnabFieldType } from './cnab-field-type'
import { CnabField } from './cnab-field'
import { CnabValidationResult } from './cnab-validation-result'

export interface CnabLineSchema {
  format: CnabFormat
  bankCode: CnabBankCode
  fieldType: CnabFieldType
  fields: (new () => CnabField)[]
  validate(
    rawLines: string[],
    isEager: boolean,
    extraFields: CnabField[],
    firstLine: number
  ): CnabValidationResult
}

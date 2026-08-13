import { CnabFormat } from './cnab-format'
import { CnabBankCode } from './cnab-bank-code'
import { CnabFieldType } from './cnab-field-type'
import { CnabField } from './cnab-field'

export interface CnabLineSchema {
  format: CnabFormat
  bankCode: CnabBankCode
  fieldType: CnabFieldType
  fields: (new () => CnabField)[]
}

import { CnabFormat } from '@cnab/types/cnab-format'
import { CnabBankCode } from '@cnab/types/cnab-bank-code'
import { CnabFieldType } from '@cnab/types/cnab-field-type'
import { CnabField } from '@cnab/types/cnab-field'

export interface CnabLineSchema {
  format: CnabFormat
  bankCode: CnabBankCode
  fieldType: CnabFieldType
  fields: (new () => CnabField)[]
}

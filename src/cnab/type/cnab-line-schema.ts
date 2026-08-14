import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabField } from '@cnab/type/cnab-field'

export interface CnabLineSchema {
  format: CnabFormat
  bank: CnabBank
  fieldType: CnabFieldType
  fields: (new () => CnabField)[]
}

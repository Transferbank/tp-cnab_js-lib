import { CnabFormat } from '@cnab/types/cnab-format'
import { CnabBank } from '@/cnab/type/cnab-bank'
import { CnabFieldType } from '@cnab/types/cnab-field-type'
import { CnabField } from '@cnab/types/cnab-field'

export interface CnabLineSchema {
  format: CnabFormat
  bank: CnabBank
  fieldType: CnabFieldType
  fields: (new () => CnabField)[]
}

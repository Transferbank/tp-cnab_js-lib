import { CnabFieldType } from '@cnab/type/cnab-field-type'

export interface CnabField {
  fieldType: CnabFieldType
  fieldName: string
  range: [number, number]
}

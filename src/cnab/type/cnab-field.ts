import { CnabFieldType } from '@cnab/types/cnab-field-type'

export interface CnabField {
  fieldType: CnabFieldType
  fieldName: string
  range: [number, number]
}

import { CnabFieldClass, optional } from '@cnab/type/cnab-field'
import * as Cnab240BancoDoBrasil from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/fields'

export const CNAB_DATA_DE_JUROS_FIELDS: CnabFieldClass[] = [
  optional(Cnab240BancoDoBrasil.DataDeJurosBoletoField)
]

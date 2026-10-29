import { CnabFieldClass, optional } from '@cnab/type/cnab-field'
import * as Cnab240BancoDoBrasil from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/fields'
import * as Cnab400BancoDoBrasil from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/fields'

export const CNAB_DATA_DE_MULTA_FIELDS: CnabFieldClass[] = [
  optional(Cnab240BancoDoBrasil.DataDeMultaBoletoField),
  optional(Cnab400BancoDoBrasil.DataDeMultaBoletoField)
]

import { CnabFieldClass, optional } from '@cnab/type/cnab-field'
import * as Cnab240BancoDoBrasil from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/fields'
import * as Cnab240Bradesco from '@cnab/bank/bradesco/cnab/cnab240/field/fields'
import * as Cnab240Caixa from '@cnab/bank/caixa/cnab/cnab240/field/fields'
import * as Cnab400Caixa from '@cnab/bank/caixa/cnab/cnab400/field/fields'

export const CNAB_TELEFONE_FIELDS: CnabFieldClass[] = [
  optional(Cnab240BancoDoBrasil.DddBoletoField),
  optional(Cnab240BancoDoBrasil.CelularBoletoField),
  optional(Cnab240Bradesco.DddBoletoField),
  optional(Cnab240Bradesco.CelularBoletoField),
  optional(Cnab240Caixa.DddBoletoField),
  optional(Cnab240Caixa.CelularBoletoField),
  optional(Cnab400Caixa.DddBoletoField),
  optional(Cnab400Caixa.CelularBoletoField)
]

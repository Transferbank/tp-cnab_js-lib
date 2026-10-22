import { CnabFieldClass, optional } from '@cnab/type/cnab-field'
import * as Cnab240BancoDoBrasil from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/fields'
import * as Cnab240Bradesco from '@cnab/bank/bradesco/cnab/cnab240/field/fields'
import { Cnab240CaixaBoletoDddField, Cnab240CaixaBoletoCelularField } from '@cnab/bank/caixa/cnab/cnab240/field/fields'
import { Cnab400CaixaBoletoDddField, Cnab400CaixaBoletoCelularField } from '@cnab/bank/caixa/cnab/cnab400/field/fields'

export const CNAB_TELEFONE_FIELDS: CnabFieldClass[] = [
  optional(Cnab240BancoDoBrasil.DddBoletoField),
  optional(Cnab240BancoDoBrasil.CelularBoletoField),
  optional(Cnab240Bradesco.DddBoletoField),
  optional(Cnab240Bradesco.CelularBoletoField),
  optional(Cnab240CaixaBoletoDddField),
  optional(Cnab240CaixaBoletoCelularField),
  optional(Cnab400CaixaBoletoDddField),
  optional(Cnab400CaixaBoletoCelularField)
]

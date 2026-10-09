import { CnabFieldClass, optional } from '@cnab/type/cnab-field'
import { Cnab240BancoDoBrasilBoletoDddField, Cnab240BancoDoBrasilBoletoCelularField } from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/fields'
import { Cnab240BradescoBoletoDddField, Cnab240BradescoBoletoCelularField } from '@cnab/bank/bradesco/cnab/cnab240/field/fields'
import { Cnab240CaixaBoletoDddField, Cnab240CaixaBoletoCelularField } from '@cnab/bank/caixa/cnab/cnab240/field/fields'
import { Cnab400CaixaBoletoDddField, Cnab400CaixaBoletoCelularField } from '@cnab/bank/caixa/cnab/cnab400/field/fields'

export const CNAB_TELEFONE_FIELDS: CnabFieldClass[] = [
  optional(Cnab240BancoDoBrasilBoletoDddField),
  optional(Cnab240BancoDoBrasilBoletoCelularField),
  optional(Cnab240BradescoBoletoDddField),
  optional(Cnab240BradescoBoletoCelularField),
  optional(Cnab240CaixaBoletoDddField),
  optional(Cnab240CaixaBoletoCelularField),
  optional(Cnab400CaixaBoletoDddField),
  optional(Cnab400CaixaBoletoCelularField)
]

import { CnabFieldClass, optional } from '@cnab/type/cnab-field'
import * as Cnab240BancoDoBrasil from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/fields'
import * as Cnab400BancoDoBrasil from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/fields'

export const CNAB_SEU_NUMERO_FIELDS: CnabFieldClass[] = [
  optional(Cnab240BancoDoBrasil.SeuNumeroBoletoField),
  optional(Cnab400BancoDoBrasil.SeuNumeroBoletoField),
  optional(Cnab400BancoDoBrasil.SeuNumeroRegistro5BoletoField)
]

export const CNAB_USO_DA_EMPRESA_FIELDS: CnabFieldClass[] = [
  optional(Cnab240BancoDoBrasil.UsoDaEmpresaBoletoField),
  optional(Cnab400BancoDoBrasil.UsoDaEmpresaBoletoField)
]

export const CNAB_IDENTIFICATION_FIELDS: CnabFieldClass[] = [
  ...CNAB_SEU_NUMERO_FIELDS,
  ...CNAB_USO_DA_EMPRESA_FIELDS
]

import { CnabFieldClass, optional } from '@cnab/type/cnab-field'
import {
  Cnab240BancoDoBrasilBoletoSeuNumeroField,
  Cnab240BancoDoBrasilBoletoUsoDaEmpresaField
} from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/fields'
import {
  Cnab400BancoDoBrasilBoletoSeuNumeroField,
  Cnab400BancoDoBrasilBoletoSeuNumeroRegistro5Field,
  Cnab400BancoDoBrasilBoletoUsoDaEmpresaField
} from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/fields'

export const CNAB_SEU_NUMERO_FIELDS: CnabFieldClass[] = [
  optional(Cnab240BancoDoBrasilBoletoSeuNumeroField),
  optional(Cnab400BancoDoBrasilBoletoSeuNumeroField),
  optional(Cnab400BancoDoBrasilBoletoSeuNumeroRegistro5Field)
]

export const CNAB_USO_DA_EMPRESA_FIELDS: CnabFieldClass[] = [
  optional(Cnab240BancoDoBrasilBoletoUsoDaEmpresaField),
  optional(Cnab400BancoDoBrasilBoletoUsoDaEmpresaField)
]

export const CNAB_IDENTIFICATION_FIELDS: CnabFieldClass[] = [
  ...CNAB_SEU_NUMERO_FIELDS,
  ...CNAB_USO_DA_EMPRESA_FIELDS
]

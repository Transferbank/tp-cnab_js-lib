import { CnabFieldClass, optional } from '@cnab/type/cnab-field'
import * as Cnab240BancoDoBrasil from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/fields'
import * as Cnab400BancoDoBrasil from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/fields'
import * as Cnab240Bradesco from '@cnab/bank/bradesco/cnab/cnab240/field/fields'
import * as Cnab400Bradesco from '@cnab/bank/bradesco/cnab/cnab400/field/fields'
import * as Cnab240Caixa from '@cnab/bank/caixa/cnab/cnab240/field/fields'
import * as Cnab400Caixa from '@cnab/bank/caixa/cnab/cnab400/field/fields'
import * as Cnab240Itau from '@cnab/bank/itau/cnab/cnab240/field/fields'
import * as Cnab400Itau from '@cnab/bank/itau/cnab/cnab400/field/fields'
import * as Cnab240Santander from '@cnab/bank/santander/cnab/cnab240/field/fields'
import * as Cnab400Santander from '@cnab/bank/santander/cnab/cnab400/field/fields'
import * as Cnab240Sicoob from '@cnab/bank/sicoob/cnab/cnab240/field/fields'
import * as Cnab400Sicoob from '@cnab/bank/sicoob/cnab/cnab400/field/fields'
import * as Cnab240Sicredi from '@cnab/bank/sicredi/cnab/cnab240/field/fields'
import * as Cnab400Sicredi from '@cnab/bank/sicredi/cnab/cnab400/field/fields'

export const CNAB_SEU_NUMERO_FIELDS: CnabFieldClass[] = [
  optional(Cnab240BancoDoBrasil.SeuNumeroBoletoField),
  optional(Cnab400BancoDoBrasil.SeuNumeroBoletoField),
  optional(Cnab400BancoDoBrasil.SeuNumeroRegistro5BoletoField),
  optional(Cnab240Bradesco.SeuNumeroBoletoField),
  optional(Cnab400Bradesco.SeuNumeroBoletoField),
  optional(Cnab240Caixa.SeuNumeroBoletoField),
  optional(Cnab400Caixa.SeuNumeroBoletoField),
  optional(Cnab240Itau.SeuNumeroBoletoField),
  optional(Cnab400Itau.SeuNumeroBoletoField),
  optional(Cnab240Santander.SeuNumeroBoletoField),
  optional(Cnab400Santander.SeuNumeroBoletoField),
  optional(Cnab240Sicoob.SeuNumeroBoletoField),
  optional(Cnab400Sicoob.SeuNumeroBoletoField),
  optional(Cnab240Sicredi.SeuNumeroBoletoField),
  optional(Cnab400Sicredi.SeuNumeroBoletoField)
]

export const CNAB_USO_DA_EMPRESA_FIELDS: CnabFieldClass[] = [
  optional(Cnab240BancoDoBrasil.UsoDaEmpresaBoletoField),
  optional(Cnab400BancoDoBrasil.UsoDaEmpresaBoletoField),
  optional(Cnab240Bradesco.UsoDaEmpresaBoletoField),
  optional(Cnab400Bradesco.UsoDaEmpresaBoletoField),
  optional(Cnab240Caixa.UsoDaEmpresaBoletoField),
  optional(Cnab400Caixa.UsoDaEmpresaBoletoField),
  optional(Cnab240Itau.UsoDaEmpresaBoletoField),
  optional(Cnab400Itau.UsoDaEmpresaBoletoField),
  optional(Cnab240Santander.UsoDaEmpresaBoletoField),
  optional(Cnab400Santander.UsoDaEmpresaBoletoField),
  optional(Cnab240Sicoob.UsoDaEmpresaBoletoField),
  optional(Cnab400Sicoob.UsoDaEmpresaBoletoField),
  optional(Cnab240Sicredi.UsoDaEmpresaBoletoField)
]

export const CNAB_IDENTIFICATION_FIELDS: CnabFieldClass[] = [
  ...CNAB_SEU_NUMERO_FIELDS,
  ...CNAB_USO_DA_EMPRESA_FIELDS
]

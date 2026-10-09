import { CnabFieldClass, optional } from '@cnab/type/cnab-field'
import { CnabBank } from '@cnab/type/cnab-bank'
import { Cnab240BoletoSeuNumeroField } from '@cnab/field/cnab240/boleto-seu-numero-field'
import { Cnab240BoletoUsoDaEmpresaField } from '@cnab/field/cnab240/boleto-uso-da-empresa-field'
import { Cnab240BoletoNossoNumeroField } from '@cnab/field/cnab240/boleto-nosso-numero-field'
import { Cnab400BoletoSeuNumeroField } from '@cnab/field/cnab400/boleto-seu-numero-field'
import { Cnab400BoletoUsoDaEmpresaField } from '@cnab/field/cnab400/boleto-uso-da-empresa-field'
import { Cnab400BoletoNossoNumeroField } from '@cnab/field/cnab400/boleto-nosso-numero-field'

export const CNAB_SEU_NUMERO_FIELDS: CnabFieldClass[] = [
  optional(Cnab240BoletoSeuNumeroField({ bank: CnabBank.BANCODOBRASIL })),
  optional(Cnab400BoletoSeuNumeroField({ bank: CnabBank.BANCODOBRASIL, range: [111, 120], recordType: '7' })),
  optional(Cnab400BoletoSeuNumeroField({ bank: CnabBank.BANCODOBRASIL, range: [4, 18], recordType: '503' }))
]

export const CNAB_USO_DA_EMPRESA_FIELDS: CnabFieldClass[] = [
  optional(Cnab240BoletoUsoDaEmpresaField({ bank: CnabBank.BANCODOBRASIL })),
  optional(Cnab400BoletoUsoDaEmpresaField({ bank: CnabBank.BANCODOBRASIL, range: [39, 63], recordType: '7' }))
]

export const CNAB_NOSSO_NUMERO_FIELDS: CnabFieldClass[] = [
  optional(Cnab240BoletoNossoNumeroField({ bank: CnabBank.BANCODOBRASIL })),
  optional(Cnab400BoletoNossoNumeroField({ bank: CnabBank.BANCODOBRASIL, range: [64, 80], recordType: '7' }))
]

export const CNAB_IDENTIFICATION_FIELDS: CnabFieldClass[] = [
  ...CNAB_SEU_NUMERO_FIELDS,
  ...CNAB_USO_DA_EMPRESA_FIELDS,
  ...CNAB_NOSSO_NUMERO_FIELDS
]

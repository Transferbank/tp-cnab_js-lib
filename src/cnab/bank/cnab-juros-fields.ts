import { CnabFieldClass, optional } from '@cnab/type/cnab-field'
import * as Cnab240BancoDoBrasil from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/fields'
import * as Cnab240Bradesco from '@cnab/bank/bradesco/cnab/cnab240/field/fields'
import * as Cnab240Caixa from '@cnab/bank/caixa/cnab/cnab240/field/fields'
import * as Cnab400Caixa from '@cnab/bank/caixa/cnab/cnab400/field/fields'
import * as Cnab240Itau from '@cnab/bank/itau/cnab/cnab240/field/fields'
import * as Cnab400Itau from '@cnab/bank/itau/cnab/cnab400/field/fields'
import * as Cnab240Santander from '@cnab/bank/santander/cnab/cnab240/field/fields'
import * as Cnab240Sicoob from '@cnab/bank/sicoob/cnab/cnab240/field/fields'
import * as Cnab240Sicredi from '@cnab/bank/sicredi/cnab/cnab240/field/fields'
import * as Cnab400Sicredi from '@cnab/bank/sicredi/cnab/cnab400/field/fields'

export const CNAB_DATA_DE_JUROS_FIELDS: CnabFieldClass[] = [
  optional(Cnab240BancoDoBrasil.DataDeJurosBoletoField),
  optional(Cnab240Bradesco.DataDeJurosBoletoField),
  optional(Cnab240Caixa.DataDeJurosBoletoField),
  optional(Cnab400Caixa.DataDeJurosBoletoField),
  optional(Cnab240Itau.DataDeJurosBoletoField),
  optional(Cnab400Itau.DataDeJurosBoletoField),
  optional(Cnab240Santander.DataDeJurosBoletoField),
  optional(Cnab240Sicoob.DataDeJurosBoletoField),
  optional(Cnab240Sicredi.DataDeJurosBoletoField),
  optional(Cnab400Sicredi.DataDeJurosBoletoField)
]

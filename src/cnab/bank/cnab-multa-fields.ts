import { CnabFieldClass, optional } from '@cnab/type/cnab-field'
import * as Cnab240BancoDoBrasil from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/fields'
import * as Cnab400BancoDoBrasil from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/fields'
import * as Cnab240Bradesco from '@cnab/bank/bradesco/cnab/cnab240/field/fields'
import * as Cnab240Caixa from '@cnab/bank/caixa/cnab/cnab240/field/fields'
import * as Cnab400Caixa from '@cnab/bank/caixa/cnab/cnab400/field/fields'
import * as Cnab240Itau from '@cnab/bank/itau/cnab/cnab240/field/fields'
import * as Cnab400Itau from '@cnab/bank/itau/cnab/cnab400/field/fields'
import * as Cnab240Santander from '@cnab/bank/santander/cnab/cnab240/field/fields'
import * as Cnab400Santander from '@cnab/bank/santander/cnab/cnab400/field/fields'
import * as Cnab240Sicoob from '@cnab/bank/sicoob/cnab/cnab240/field/fields'
import * as Cnab240Sicredi from '@cnab/bank/sicredi/cnab/cnab240/field/fields'
import * as Cnab400Sicredi from '@cnab/bank/sicredi/cnab/cnab400/field/fields'

export const CNAB_DATA_DE_MULTA_FIELDS: CnabFieldClass[] = [
  optional(Cnab240BancoDoBrasil.DataDeMultaBoletoField),
  optional(Cnab400BancoDoBrasil.DataDeMultaBoletoField),
  optional(Cnab240Bradesco.DataDeMultaBoletoField),
  optional(Cnab240Caixa.DataDeMultaBoletoField),
  optional(Cnab400Caixa.DataDeMultaBoletoField),
  optional(Cnab240Itau.DataDeMultaBoletoField),
  optional(Cnab400Itau.DataDeMultaBoletoField),
  optional(Cnab240Santander.DataDeMultaBoletoField),
  optional(Cnab400Santander.DataDeMultaBoletoField),
  optional(Cnab240Sicoob.DataDeMultaBoletoField),
  optional(Cnab240Sicredi.DataDeMultaBoletoField),
  optional(Cnab400Sicredi.DataDeMultaBoletoField)
]

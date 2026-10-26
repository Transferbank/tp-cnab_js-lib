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

export const CNAB_PARCELA_FIELDS: CnabFieldClass[] = [
  optional(Cnab240BancoDoBrasil.ParcelaBoletoField),
  optional(Cnab240BancoDoBrasil.TotalDeParcelasBoletoField),
  optional(Cnab400BancoDoBrasil.ParcelaBoletoField),
  optional(Cnab400BancoDoBrasil.TotalDeParcelasBoletoField),
  optional(Cnab240Bradesco.ParcelaBoletoField),
  optional(Cnab240Bradesco.TotalDeParcelasBoletoField),
  optional(Cnab400Bradesco.ParcelaBoletoField),
  optional(Cnab400Bradesco.TotalDeParcelasBoletoField),
  optional(Cnab240Caixa.ParcelaBoletoField),
  optional(Cnab240Caixa.TotalDeParcelasBoletoField),
  optional(Cnab400Caixa.ParcelaBoletoField),
  optional(Cnab400Caixa.TotalDeParcelasBoletoField),
  optional(Cnab240Itau.ParcelaBoletoField),
  optional(Cnab240Itau.TotalDeParcelasBoletoField),
  optional(Cnab400Itau.ParcelaBoletoField),
  optional(Cnab400Itau.TotalDeParcelasBoletoField),
  optional(Cnab240Santander.ParcelaBoletoField),
  optional(Cnab240Santander.TotalDeParcelasBoletoField),
  optional(Cnab400Santander.ParcelaBoletoField),
  optional(Cnab400Santander.TotalDeParcelasBoletoField),
  optional(Cnab240Sicoob.ParcelaBoletoField),
  optional(Cnab240Sicoob.TotalDeParcelasBoletoField),
  optional(Cnab400Sicoob.ParcelaBoletoField),
  optional(Cnab400Sicoob.TotalDeParcelasBoletoField),
  optional(Cnab240Sicredi.ParcelaBoletoField),
  optional(Cnab240Sicredi.TotalDeParcelasBoletoField),
  optional(Cnab400Sicredi.ParcelaBoletoField),
  optional(Cnab400Sicredi.TotalDeParcelasBoletoField)
]

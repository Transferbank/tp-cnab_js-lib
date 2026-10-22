import { CnabFieldClass, optional } from '@cnab/type/cnab-field'
import * as Cnab240BancoDoBrasil from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/fields'
import * as Cnab400BancoDoBrasil from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/fields'
import * as Cnab240Bradesco from '@cnab/bank/bradesco/cnab/cnab240/field/fields'
import * as Cnab240Caixa from '@cnab/bank/caixa/cnab/cnab240/field/fields'
import * as Cnab400Caixa from '@cnab/bank/caixa/cnab/cnab400/field/fields'
import { Cnab400ItauBoletoEmailField } from '@cnab/bank/itau/cnab/cnab400/field/fields'

export const CNAB_EMAIL_FIELDS: CnabFieldClass[] = [
  optional(Cnab240BancoDoBrasil.EmailSegmentoSBoletoField),
  optional(Cnab240BancoDoBrasil.EmailSegmentoYBoletoField),
  optional(Cnab400BancoDoBrasil.EmailBoletoField),
  optional(Cnab240Bradesco.EmailBoletoField),
  optional(Cnab240Caixa.EmailBoletoField),
  optional(Cnab400Caixa.EmailBoletoField),
  optional(Cnab400ItauBoletoEmailField)
]

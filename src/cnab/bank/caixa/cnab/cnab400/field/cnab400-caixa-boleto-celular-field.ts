import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { Cnab400BoletoCelularField } from '@cnab/field/cnab400/boleto-celular-field'

export class Cnab400CaixaBoletoCelularField extends Cnab400BoletoCelularField {
  static readonly bank = CnabBank.CAIXA
  static readonly format = CnabFormat.CNAB400
}

import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { Cnab400BoletoDddField } from '@cnab/field/cnab400/boleto-ddd-field'

export class Cnab400CaixaBoletoDddField extends Cnab400BoletoDddField {
  static readonly bank = CnabBank.CAIXA
  static readonly format = CnabFormat.CNAB400
}

import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { Cnab240BoletoDddField } from '@cnab/field/cnab240/boleto-ddd-field'

export class Cnab240BradescoBoletoDddField extends Cnab240BoletoDddField {
  static readonly bank = CnabBank.BRADESCO
  static readonly format = CnabFormat.CNAB240
}

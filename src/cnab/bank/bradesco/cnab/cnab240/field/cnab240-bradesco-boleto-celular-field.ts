import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { Cnab240BoletoCelularField } from '@cnab/field/cnab240/boleto-celular-field'

export class Cnab240BradescoBoletoCelularField extends Cnab240BoletoCelularField {
  static readonly bank = CnabBank.BRADESCO
  static readonly format = CnabFormat.CNAB240
}

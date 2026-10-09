import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { Cnab240BoletoDddField } from '@cnab/field/cnab240/boleto-ddd-field'

export class Cnab240CaixaBoletoDddField extends Cnab240BoletoDddField {
  static readonly bank = CnabBank.CAIXA
  static readonly format = CnabFormat.CNAB240
  protected readonly optionalRecordCode: string = '04'
}

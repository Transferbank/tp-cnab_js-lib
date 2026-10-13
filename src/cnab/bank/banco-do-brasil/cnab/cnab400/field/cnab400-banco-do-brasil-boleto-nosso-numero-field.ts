import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { Cnab400BoletoNossoNumeroField } from '@cnab/field/cnab400/boleto-nosso-numero-field'

export class Cnab400BancoDoBrasilBoletoNossoNumeroField extends Cnab400BoletoNossoNumeroField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB400
  protected readonly recordType: string = '7'
  readonly range: [number, number] = [64, 80]
}

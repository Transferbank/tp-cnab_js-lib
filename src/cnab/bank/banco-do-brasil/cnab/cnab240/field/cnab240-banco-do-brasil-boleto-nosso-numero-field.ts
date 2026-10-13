import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { Cnab240BoletoNossoNumeroField } from '@cnab/field/cnab240/boleto-nosso-numero-field'

export class Cnab240BancoDoBrasilBoletoNossoNumeroField extends Cnab240BoletoNossoNumeroField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB240
}

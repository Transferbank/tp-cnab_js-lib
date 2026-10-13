import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { Cnab400BoletoSeuNumeroField } from '@cnab/field/cnab400/boleto-seu-numero-field'

export class Cnab400BancoDoBrasilBoletoSeuNumeroRegistro5Field extends Cnab400BoletoSeuNumeroField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB400
  protected readonly recordType: string = '503'
  readonly range: [number, number] = [4, 18]
}

import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { Cnab400BoletoUsoDaEmpresaField } from '@cnab/field/cnab400/boleto-uso-da-empresa-field'

export class Cnab400BancoDoBrasilBoletoUsoDaEmpresaField extends Cnab400BoletoUsoDaEmpresaField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB400
  protected readonly recordType: string = '7'
  readonly range: [number, number] = [39, 63]
}

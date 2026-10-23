import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { ParcelaBoletoField as Cnab400ParcelaBoletoField } from '@cnab/field/cnab400/parcela-boleto-field'

export class ParcelaBoletoField extends Cnab400ParcelaBoletoField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB400
  protected readonly recordType: string = '7'
  protected readonly usoDaEmpresaRange: [number, number] | null = [39, 63]
}

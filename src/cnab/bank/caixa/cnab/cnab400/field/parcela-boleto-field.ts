import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { ParcelaBoletoField as Cnab400ParcelaBoletoField } from '@cnab/field/cnab400/parcela-boleto-field'

export class ParcelaBoletoField extends Cnab400ParcelaBoletoField {
  static readonly bank = CnabBank.CAIXA
  static readonly format = CnabFormat.CNAB400
  protected readonly usoDaEmpresaRange: [number, number] | null = [32, 56]
  protected readonly seuNumeroRange: [number, number] = [117, 126]
}

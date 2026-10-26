import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { UsoDaEmpresaBoletoField as Cnab400UsoDaEmpresaBoletoField } from '@cnab/field/cnab400/uso-da-empresa-boleto-field'

export class UsoDaEmpresaBoletoField extends Cnab400UsoDaEmpresaBoletoField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB400
  protected readonly recordType: string = '7'
  readonly range: [number, number] = [39, 63]
}

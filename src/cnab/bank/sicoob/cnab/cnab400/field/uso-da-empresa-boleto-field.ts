import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { UsoDaEmpresaBoletoField as Cnab400UsoDaEmpresaBoletoField } from '@cnab/field/cnab400/uso-da-empresa-boleto-field'

export class UsoDaEmpresaBoletoField extends Cnab400UsoDaEmpresaBoletoField {
  static readonly bank = CnabBank.SICOOB
  static readonly format = CnabFormat.CNAB400
}

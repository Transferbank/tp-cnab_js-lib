import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { UsoDaEmpresaBoletoField as Cnab240UsoDaEmpresaBoletoField } from '@cnab/field/cnab240/uso-da-empresa-boleto-field'

export class UsoDaEmpresaBoletoField extends Cnab240UsoDaEmpresaBoletoField {
  static readonly bank = CnabBank.SICREDI
  static readonly format = CnabFormat.CNAB240
}

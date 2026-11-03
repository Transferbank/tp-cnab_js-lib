import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { DescontosAdicionaisBoletoField as Cnab240DescontosAdicionaisBoletoField } from '@cnab/field/cnab240/descontos-adicionais-boleto-field'

export class DescontosAdicionaisBoletoField extends Cnab240DescontosAdicionaisBoletoField {
  static readonly bank = CnabBank.CAIXA
  static readonly format = CnabFormat.CNAB240
}

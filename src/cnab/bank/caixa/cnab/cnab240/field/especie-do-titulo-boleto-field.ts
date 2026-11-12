import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { EspecieDoTituloBoletoField as Cnab240EspecieDoTituloBoletoField } from '@cnab/field/cnab240/especie-do-titulo-boleto-field'

export class EspecieDoTituloBoletoField extends Cnab240EspecieDoTituloBoletoField {
  static readonly bank = CnabBank.CAIXA
  static readonly format = CnabFormat.CNAB240
}

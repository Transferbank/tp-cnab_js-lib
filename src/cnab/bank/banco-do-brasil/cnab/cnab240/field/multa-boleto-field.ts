import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { MultaBoletoField as Cnab240MultaBoletoField } from '@cnab/field/cnab240/multa-boleto-field'
import { EspecieDoTituloBoletoField } from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/especie-do-titulo-boleto-field'

export class MultaBoletoField extends Cnab240MultaBoletoField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB240
  static readonly validatesInGroup = true
  protected readonly dispensingField = EspecieDoTituloBoletoField
  protected readonly dispensingValues = ['31', '32']
}

import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { DataDeMultaBoletoField as Cnab240DataDeMultaBoletoField } from '@cnab/field/cnab240/data-de-multa-boleto-field'
import { EspecieDoTituloBoletoField } from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/especie-do-titulo-boleto-field'

export class DataDeMultaBoletoField extends Cnab240DataDeMultaBoletoField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB240
  static readonly dependencies = [EspecieDoTituloBoletoField]
  protected readonly dispensingField = EspecieDoTituloBoletoField
  protected readonly dispensingValues = ['31', '32']
}

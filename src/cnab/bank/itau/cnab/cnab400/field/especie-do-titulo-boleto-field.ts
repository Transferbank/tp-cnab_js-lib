import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { EspecieDoTituloBoletoField as Cnab400EspecieDoTituloBoletoField } from '@cnab/field/cnab400/especie-do-titulo-boleto-field'

export class EspecieDoTituloBoletoField extends Cnab400EspecieDoTituloBoletoField {
  static readonly bank = CnabBank.ITAU
  static readonly format = CnabFormat.CNAB400
}

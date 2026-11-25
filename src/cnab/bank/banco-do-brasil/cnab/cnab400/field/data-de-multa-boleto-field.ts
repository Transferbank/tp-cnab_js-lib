import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { DataDeMultaBoletoField as Cnab400DataDeMultaBoletoField } from '@cnab/field/cnab400/data-de-multa-boleto-field'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { EspecieDoTituloBoletoField } from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/especie-do-titulo-boleto-field'

export class DataDeMultaBoletoField extends Cnab400DataDeMultaBoletoField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB400
  static readonly validatesInGroup = true
  readonly range: [number, number] = [5, 10]
  protected readonly dispensingField = EspecieDoTituloBoletoField
  protected readonly dispensingValues = ['31', '32']

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isRegistro(this.rawLine, '5', '99')
  }
}

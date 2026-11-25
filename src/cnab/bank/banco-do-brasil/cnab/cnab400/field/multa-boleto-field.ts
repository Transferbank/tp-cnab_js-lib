import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { MultaBoletoField as Cnab400MultaBoletoField } from '@cnab/field/cnab400/multa-boleto-field'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { EspecieDoTituloBoletoField } from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/especie-do-titulo-boleto-field'

export class MultaBoletoField extends Cnab400MultaBoletoField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB400
  static readonly validatesInGroup = true
  readonly range: [number, number] = [11, 22]
  protected readonly dispensingField = EspecieDoTituloBoletoField
  protected readonly dispensingValues = ['31', '32']

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isRegistro(this.rawLine, '5', '99')
  }
}

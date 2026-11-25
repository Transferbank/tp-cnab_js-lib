import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { JurosBoletoField as Cnab400JurosBoletoField } from '@cnab/field/cnab400/juros-boleto-field'
import { EspecieDoTituloBoletoField } from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/especie-do-titulo-boleto-field'
import { CnabNumberedLine } from '@cnab/type/cnab-field'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { isEspecieWithoutJurosAndMulta } from '@cnab/bank/banco-do-brasil/especie-without-juros-and-multa'

export class JurosBoletoField extends Cnab400JurosBoletoField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB400
  static readonly dependencies = [EspecieDoTituloBoletoField]
  protected readonly recordType: string = '7'

  validateInGroup(group: CnabNumberedLine[]): CnabValidationResult {
    const especie = this.readDependency(group, EspecieDoTituloBoletoField)
    if (isEspecieWithoutJurosAndMulta(especie)) {
      return { isValid: true, errors: [] }
    }
    return super.validateInGroup(group)
  }

  readInGroup(group: CnabNumberedLine[]): number | null {
    const especie = this.readDependency(group, EspecieDoTituloBoletoField)
    if (isEspecieWithoutJurosAndMulta(especie)) {
      return null
    }
    return super.readInGroup(group)
  }
}

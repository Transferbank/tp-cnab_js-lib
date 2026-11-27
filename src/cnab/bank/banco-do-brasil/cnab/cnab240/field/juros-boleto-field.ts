import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { JurosBoletoField as Cnab240JurosBoletoField } from '@cnab/field/cnab240/juros-boleto-field'
import { CnabNumberedLine } from '@cnab/type/cnab-field'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { EspecieDoTituloBoletoField } from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/especie-do-titulo-boleto-field'

const ESPECIES_WITHOUT_JUROS_AND_MULTA = ['31', '32']

export class JurosBoletoField extends Cnab240JurosBoletoField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB240
  static readonly resolvesInGroup = true

  validateInGroup(lines: CnabNumberedLine[], lineResult: CnabValidationResult): CnabValidationResult {
    const especie = this.readFieldInGroup(lines, EspecieDoTituloBoletoField)
    if (especie != null && ESPECIES_WITHOUT_JUROS_AND_MULTA.includes(especie)) {
      return { isValid: true, errors: [] }
    }
    return lineResult
  }

  readInGroup(lines: CnabNumberedLine[]): number | null {
    const especie = this.readFieldInGroup(lines, EspecieDoTituloBoletoField)
    if (especie != null && ESPECIES_WITHOUT_JUROS_AND_MULTA.includes(especie)) {
      return null
    }
    return this.value
  }
}

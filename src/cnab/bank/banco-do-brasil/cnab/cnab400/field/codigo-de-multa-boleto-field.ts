import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CodigoDeMultaBoletoField as Cnab400CodigoDeMultaBoletoField } from '@cnab/field/cnab400/codigo-de-multa-boleto-field'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabNumberedLine } from '@cnab/type/cnab-field'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { EspecieDoTituloBoletoField } from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/especie-do-titulo-boleto-field'

const ESPECIES_WITHOUT_JUROS_AND_MULTA = ['31', '32']

export class CodigoDeMultaBoletoField extends Cnab400CodigoDeMultaBoletoField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB400
  static readonly resolvesInGroup = true
  readonly range: [number, number] = [4, 4]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isRegistro(this.rawLine, '5', '99')
  }

  validateInGroup(lines: CnabNumberedLine[], lineResult: CnabValidationResult): CnabValidationResult {
    const especie = this.readFieldInGroup(lines, EspecieDoTituloBoletoField)
    if (especie != null && ESPECIES_WITHOUT_JUROS_AND_MULTA.includes(especie)) {
      return { isValid: true, errors: [] }
    }
    return lineResult
  }

  readInGroup(lines: CnabNumberedLine[]): string | null {
    const especie = this.readFieldInGroup(lines, EspecieDoTituloBoletoField)
    if (especie != null && ESPECIES_WITHOUT_JUROS_AND_MULTA.includes(especie)) {
      return null
    }
    return this.value
  }
}

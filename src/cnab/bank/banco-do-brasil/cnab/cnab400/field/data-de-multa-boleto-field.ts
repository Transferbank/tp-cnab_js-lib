import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { DataDeMultaBoletoField as Cnab400DataDeMultaBoletoField } from '@cnab/field/cnab400/data-de-multa-boleto-field'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { EspecieDoTituloBoletoField } from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/especie-do-titulo-boleto-field'
import { CnabNumberedLine } from '@cnab/type/cnab-field'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { isEspecieWithoutCharges } from '@cnab/bank/banco-do-brasil/especie-without-charges'

export class DataDeMultaBoletoField extends Cnab400DataDeMultaBoletoField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB400
  static readonly dependencies = [EspecieDoTituloBoletoField]
  readonly range: [number, number] = [5, 10]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isRegistro(this.rawLine, '5', '99')
  }

  validateInGroup(group: CnabNumberedLine[]): CnabValidationResult {
    const especie = this.groupValue(group, EspecieDoTituloBoletoField)
    if (isEspecieWithoutCharges(especie)) {
      return { isValid: true, errors: [] }
    }
    return super.validateInGroup(group)
  }

  readInGroup(group: CnabNumberedLine[]): Date | null {
    const especie = this.groupValue(group, EspecieDoTituloBoletoField)
    if (isEspecieWithoutCharges(especie)) {
      return null
    }
    return super.readInGroup(group)
  }
}

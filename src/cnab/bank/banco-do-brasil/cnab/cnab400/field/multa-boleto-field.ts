import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { MultaBoletoField as Cnab400MultaBoletoField } from '@cnab/field/cnab400/multa-boleto-field'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { EspecieDoTituloBoletoField } from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/especie-do-titulo-boleto-field'
import { CnabNumberedLine } from '@cnab/type/cnab-field'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { isEspecieWithoutCharges } from '@cnab/bank/banco-do-brasil/especie-without-charges'

export class MultaBoletoField extends Cnab400MultaBoletoField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB400
  static readonly dependencies = [EspecieDoTituloBoletoField]
  readonly range: [number, number] = [11, 22]

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

  readInGroup(group: CnabNumberedLine[]): number | null {
    const especie = this.groupValue(group, EspecieDoTituloBoletoField)
    if (isEspecieWithoutCharges(especie)) {
      return null
    }
    return super.readInGroup(group)
  }
}

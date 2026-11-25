import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CodigoDeMultaBoletoField as Cnab400CodigoDeMultaBoletoField } from '@cnab/field/cnab400/codigo-de-multa-boleto-field'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { EspecieDoTituloBoletoField } from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/especie-do-titulo-boleto-field'
import { CnabNumberedLine } from '@cnab/type/cnab-field'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { isEspecieWithoutJurosAndMulta } from '@cnab/bank/banco-do-brasil/especie-without-juros-and-multa'

export class CodigoDeMultaBoletoField extends Cnab400CodigoDeMultaBoletoField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB400
  static readonly dependencies = [EspecieDoTituloBoletoField]
  readonly range: [number, number] = [4, 4]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isRegistro(this.rawLine, '5', '99')
  }

  validateInGroup(group: CnabNumberedLine[]): CnabValidationResult {
    const especie = this.readDependency(group, EspecieDoTituloBoletoField)
    if (isEspecieWithoutJurosAndMulta(especie)) {
      return { isValid: true, errors: [] }
    }
    return super.validateInGroup(group)
  }

  readInGroup(group: CnabNumberedLine[]): string | null {
    const especie = this.readDependency(group, EspecieDoTituloBoletoField)
    if (isEspecieWithoutJurosAndMulta(especie)) {
      return null
    }
    return super.readInGroup(group)
  }
}

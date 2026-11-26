import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { MultaBoletoField as Cnab400MultaBoletoField } from '@cnab/field/cnab400/multa-boleto-field'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { EspecieDoTituloBoletoField } from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/especie-do-titulo-boleto-field'
import { CnabGroupReader } from '@cnab/type/cnab-group-reader'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { isEspecieWithoutJurosAndMulta } from '@cnab/bank/banco-do-brasil/especie-without-juros-and-multa'

export class MultaBoletoField extends Cnab400MultaBoletoField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB400
  static readonly dependencies = [EspecieDoTituloBoletoField]
  readonly range: [number, number] = [11, 22]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isRegistro(this.rawLine, '5', '99')
  }

  validateInGroup(group: CnabGroupReader): CnabValidationResult {
    const especie = group.read(EspecieDoTituloBoletoField)
    if (isEspecieWithoutJurosAndMulta(especie)) {
      return { isValid: true, errors: [] }
    }
    return super.validateInGroup(group)
  }

  readInGroup(group: CnabGroupReader): number | null {
    const especie = group.read(EspecieDoTituloBoletoField)
    if (isEspecieWithoutJurosAndMulta(especie)) {
      return null
    }
    return super.readInGroup(group)
  }
}

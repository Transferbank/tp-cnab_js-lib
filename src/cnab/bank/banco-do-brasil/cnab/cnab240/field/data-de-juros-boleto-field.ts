import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { DataDeJurosBoletoField as Cnab240DataDeJurosBoletoField } from '@cnab/field/cnab240/data-de-juros-boleto-field'
import { EspecieDoTituloBoletoField } from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/especie-do-titulo-boleto-field'
import { CnabNumberedLine } from '@cnab/type/cnab-field'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { isEspecieWithoutCharges } from '@cnab/bank/banco-do-brasil/especie-without-charges'

export class DataDeJurosBoletoField extends Cnab240DataDeJurosBoletoField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB240
  static readonly dependencies = [EspecieDoTituloBoletoField]

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

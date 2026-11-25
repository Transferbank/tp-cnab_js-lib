import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CodigoDeJurosBoletoField as Cnab240CodigoDeJurosBoletoField } from '@cnab/field/cnab240/codigo-de-juros-boleto-field'
import { EspecieDoTituloBoletoField } from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/especie-do-titulo-boleto-field'
import { CnabNumberedLine } from '@cnab/type/cnab-field'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { isEspecieWithoutCharges } from '@cnab/bank/banco-do-brasil/especie-without-charges'

export class CodigoDeJurosBoletoField extends Cnab240CodigoDeJurosBoletoField {
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

  readInGroup(group: CnabNumberedLine[]): string | null {
    const especie = this.groupValue(group, EspecieDoTituloBoletoField)
    if (isEspecieWithoutCharges(especie)) {
      return null
    }
    return super.readInGroup(group)
  }
}

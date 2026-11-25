import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CodigoDeMultaBoletoField as Cnab240CodigoDeMultaBoletoField } from '@cnab/field/cnab240/codigo-de-multa-boleto-field'
import { EspecieDoTituloBoletoField } from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/especie-do-titulo-boleto-field'
import { CnabGroupReader } from '@cnab/type/cnab-field'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { isEspecieWithoutJurosAndMulta } from '@cnab/bank/banco-do-brasil/especie-without-juros-and-multa'

export class CodigoDeMultaBoletoField extends Cnab240CodigoDeMultaBoletoField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB240
  static readonly dependencies = [EspecieDoTituloBoletoField]

  validateInGroup(group: CnabGroupReader): CnabValidationResult {
    const especie = group.read(EspecieDoTituloBoletoField)
    if (isEspecieWithoutJurosAndMulta(especie)) {
      return { isValid: true, errors: [] }
    }
    return super.validateInGroup(group)
  }

  readInGroup(group: CnabGroupReader): string | null {
    const especie = group.read(EspecieDoTituloBoletoField)
    if (isEspecieWithoutJurosAndMulta(especie)) {
      return null
    }
    return super.readInGroup(group)
  }
}

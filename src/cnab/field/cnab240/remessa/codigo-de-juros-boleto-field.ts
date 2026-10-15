import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'
import { getJurosCodes } from '@cnab/bank/cnab-tipo-de-juros-tables'
import { blankIfZeros } from '@cnab/utils/phone-parser'

export class CodigoDeJurosBoletoField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'codigo_de_juros'
  readonly range: [number, number] = [118, 118]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoP(this.rawLine)
  }

  protected extractRawValue(): string {
    return blankIfZeros(super.extractRawValue())
  }

  protected performValidation(): CnabValidationResult {
    const codigo = this.value
    const { bank, format } = this.constructor as typeof CnabField<string>
    if (codigo == null || bank == null || format == null) {
      return { isValid: true, errors: [] }
    }

    const codes = getJurosCodes(bank, format)
    if (codes == null || codes[codigo] != null) {
      return { isValid: true, errors: [] }
    }

    return {
      isValid: false,
      errors: [
        new CnabGenericFieldError({
          message: `Campo código de juros inválido: código ${codigo} não existe na tabela do banco`,
          lineNumber: this.lineNumber,
          fieldKey: this.fieldKey,
          range: this.range
        })
      ]
    }
  }

  protected parseValue(rawValue: string): string {
    return rawValue
  }
}

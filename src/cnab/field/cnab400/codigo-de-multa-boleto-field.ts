import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { getMultaCodes } from '@cnab/bank/cnab-tipo-de-multa-tables'
import { blankIfZeros } from '@cnab/utils/phone-parser'

export class CodigoDeMultaBoletoField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'codigo_de_multa'
  readonly range: [number, number] = [78, 78]
  protected readonly zeroIsAbsent: boolean = true
  protected readonly recordType: string = '1'

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isDetalhe(this.rawLine, this.recordType)
  }

  protected extractRawValue(): string {
    const rawValue = super.extractRawValue()
    return this.zeroIsAbsent ? blankIfZeros(rawValue) : rawValue
  }

  protected performValidation(): CnabValidationResult {
    const codigo = this.value
    const { bank, format } = this.constructor as typeof CnabField<string>
    if (codigo == null || bank == null || format == null) {
      return { isValid: true, errors: [] }
    }

    const codes = getMultaCodes(bank, format)
    if (codes == null || codes[codigo] != null) {
      return { isValid: true, errors: [] }
    }

    return {
      isValid: false,
      errors: [
        new CnabGenericFieldError({
          message: `Campo código de multa inválido: código ${codigo} não existe na tabela do banco`,
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

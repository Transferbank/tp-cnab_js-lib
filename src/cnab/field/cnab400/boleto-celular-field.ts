import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab400BoletoCelularField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'celular_do_sacado'
  protected readonly recordType: string = '3'
  readonly range: [number, number] = [106, 114]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isRegistro(this.rawLine, this.recordType)
  }

  protected extractRawValue(): string {
    const rawValue = super.extractRawValue()
    return /^0+$/.test(rawValue) ? '' : rawValue
  }

  protected performValidation(): CnabValidationResult {
    const value = this.value
    const isValid = value != null && /^\d{8,9}$/.test(value)

    if (isValid) {
      return { isValid, errors: [] }
    }

    return {
      isValid,
      errors: [
        new CnabGenericFieldError({
          message: 'Campo celular do sacado inválido: deve conter 8 ou 9 dígitos numéricos',
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

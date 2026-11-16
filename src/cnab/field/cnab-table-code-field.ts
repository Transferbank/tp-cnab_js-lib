import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabField } from '@cnab/type/cnab-field'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'

export abstract class CnabTableCodeField extends CnabField<string> {
  protected abstract readonly codeLabel: string

  protected abstract tableCodes(bank: CnabBank, format: CnabFormat): Record<string, unknown> | undefined

  protected performValidation(): CnabValidationResult {
    const codigo = this.value
    const { bank, format } = this.constructor as typeof CnabField<string>
    if (codigo == null || bank == null || format == null) {
      return { isValid: true, errors: [] }
    }

    const codes = this.tableCodes(bank, format)
    if (codes == null || codes[codigo] != null) {
      return { isValid: true, errors: [] }
    }

    return {
      isValid: false,
      errors: [
        new CnabGenericFieldError({
          message: `Campo ${this.codeLabel} inválido: código ${codigo} não existe na tabela do banco`,
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

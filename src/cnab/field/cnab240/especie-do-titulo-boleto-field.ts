import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { CnabTableCodeField } from '@cnab/field/cnab-table-code-field'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'
import { getEspecieCodes } from '@cnab/bank/cnab-especie-do-titulo-tables'

export class EspecieDoTituloBoletoField extends CnabTableCodeField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'especie_do_titulo'
  readonly range: [number, number] = [107, 108]
  protected readonly codeLabel = 'espécie do título'

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoP(this.rawLine)
  }

  protected performValidation(): CnabValidationResult {
    if (this.value != null) return super.performValidation()
    return {
      isValid: false,
      errors: [
        new CnabGenericFieldError({
          message: 'Campo espécie do título é obrigatório',
          lineNumber: this.lineNumber,
          fieldKey: this.fieldKey,
          range: this.range
        })
      ]
    }
  }

  protected tableCodes(bank: CnabBank, format: CnabFormat): Record<string, unknown> | undefined {
    return getEspecieCodes(bank, format)
  }
}

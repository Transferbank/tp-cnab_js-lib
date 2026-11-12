import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'
import { getEspecieCodes } from '@cnab/bank/cnab-especie-do-titulo-tables'

export class EspecieDoTituloBoletoField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'especie_do_titulo'
  readonly range: [number, number] = [107, 108]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoP(this.rawLine)
  }

  protected performValidation(): CnabValidationResult {
    const codigo = this.value
    const { bank, format } = this.constructor as typeof CnabField<string>
    if (codigo == null || bank == null || format == null) {
      return { isValid: true, errors: [] }
    }

    if (getEspecieCodes(bank, format)[codigo] != null) {
      return { isValid: true, errors: [] }
    }

    return {
      isValid: false,
      errors: [
        new CnabGenericFieldError({
          message: `Campo espécie do título inválido: código ${codigo} não existe na tabela do banco`,
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

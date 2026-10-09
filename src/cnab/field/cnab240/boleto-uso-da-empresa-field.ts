import { CnabField, CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { Cnab240IdentificationFieldOptions } from '@cnab/type/cnab-identification-field-options'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

const DEFAULT_RANGE: [number, number] = [196, 220]

export function Cnab240BoletoUsoDaEmpresaField(options: Cnab240IdentificationFieldOptions): CnabFieldClass<string> {
  return class extends CnabField<string> {
    static readonly fieldType = CnabFieldType.BOLETO
    static readonly bank = options.bank
    static readonly format = CnabFormat.CNAB240
    readonly fieldKey = 'uso_da_empresa'
    readonly range: [number, number] = options.range ?? DEFAULT_RANGE

    shouldValidate(): boolean {
      return Cnab240LineTypeChecker.isSegmentoP(this.rawLine)
    }

    protected performValidation(): CnabValidationResult {
      return { isValid: true, errors: [] }
    }

    protected parseValue(rawValue: string): string {
      return rawValue
    }
  }
}

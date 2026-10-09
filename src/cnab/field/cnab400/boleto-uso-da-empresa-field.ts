import { CnabField, CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { Cnab400IdentificationFieldOptions } from '@cnab/type/cnab-identification-field-options'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

const DEFAULT_RECORD_TYPE = '1'

export function Cnab400BoletoUsoDaEmpresaField(options: Cnab400IdentificationFieldOptions): CnabFieldClass<string> {
  return class extends CnabField<string> {
    static readonly fieldType = CnabFieldType.BOLETO
    static readonly bank = options.bank
    static readonly format = CnabFormat.CNAB400
    readonly fieldKey = 'uso_da_empresa'
    readonly range: [number, number] = options.range
    protected readonly recordType: string = options.recordType ?? DEFAULT_RECORD_TYPE

    shouldValidate(): boolean {
      return Cnab400LineTypeChecker.isDetalhe(this.rawLine, this.recordType)
    }

    protected performValidation(): CnabValidationResult {
      return { isValid: true, errors: [] }
    }

    protected parseValue(rawValue: string): string {
      return rawValue
    }
  }
}

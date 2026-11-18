import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabOcorrenciaTable, isLiquidacao } from '@cnab/type/cnab-ocorrencia'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldInvalidNumberError } from '@cnab/type/cnab-validation-error'
import { blankIfZeros } from '@cnab/utils/phone-parser'
import { parseImpliedDecimal } from '@cnab/utils/value-parser'

export abstract class ValorBoletoField extends CnabField<number> {
  static readonly fieldType = CnabFieldType.BOLETO
  protected readonly liquidacaoOnlyTable: CnabOcorrenciaTable | null = null

  protected extractRawValue(): string {
    return blankIfZeros(super.extractRawValue())
  }

  protected performValidation(): CnabValidationResult {
    return { isValid: true, errors: [] }
  }

  protected parseValue(rawValue: string): number {
    const value = parseImpliedDecimal(rawValue, 2)
    if (value == null) {
      throw new CnabFieldInvalidNumberError(this.fieldKey, rawValue)
    }
    return value
  }

  protected isReadableOcorrencia(): boolean {
    if (this.liquidacaoOnlyTable == null) {
      return true
    }
    const code = this.extractRangeFromLine(15, 17)
    return isLiquidacao(this.liquidacaoOnlyTable, code)
  }
}

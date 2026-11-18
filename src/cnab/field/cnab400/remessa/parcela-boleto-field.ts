import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { Parcela, findParcelaInRanges } from '@cnab/utils/parcela-parser'

export class ParcelaBoletoField extends CnabField<number> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey: string = 'parcela'
  protected readonly recordType: string = '1'
  protected readonly usoDaEmpresaRange: [number, number] | null = [38, 62]
  protected readonly seuNumeroRange: [number, number] = [111, 120]

  get range(): [number, number] {
    return this.usoDaEmpresaRange ?? this.seuNumeroRange
  }

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isDetalhe(this.rawLine, this.recordType)
  }

  protected extractRawValue(): string {
    const found = findParcelaInRanges(this.rawLine, [this.usoDaEmpresaRange, this.seuNumeroRange])
    return found == null ? '' : this.pick(found)?.toString() ?? ''
  }

  protected pick(found: Parcela): number | null {
    return found.parcela
  }

  protected performValidation(): CnabValidationResult {
    return { isValid: true, errors: [] }
  }

  protected parseValue(rawValue: string): number {
    return Number(rawValue)
  }
}

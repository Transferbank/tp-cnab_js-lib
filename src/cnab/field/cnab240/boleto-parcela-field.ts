import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'
import { Parcela, findParcela } from '@cnab/utils/parcela-parser'

export class Cnab240BoletoParcelaField extends CnabField<number> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey: string = 'parcela'
  protected readonly usoDaEmpresaRange: [number, number] | null = [196, 220]
  protected readonly seuNumeroRange: [number, number] = [63, 77]

  get range(): [number, number] {
    return this.usoDaEmpresaRange ?? this.seuNumeroRange
  }

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoP(this.rawLine)
  }

  protected extractRawValue(): string {
    for (const range of [this.usoDaEmpresaRange, this.seuNumeroRange]) {
      if (range == null) continue
      const found = findParcela(this.extractRangeFromLine(range[0] - 1, range[1]))
      if (found != null) return this.pick(found)?.toString() ?? ''
    }
    return ''
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

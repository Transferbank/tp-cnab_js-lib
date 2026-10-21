import { CnabField, CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldInvalidNumberError } from '@cnab/type/cnab-validation-error'
import { Parcela, findParcela } from '@cnab/utils/parcela-parser'
import { isDigitsOnly } from '@cnab/utils/value-parser'
import { Cnab240BoletoSeuNumeroField } from '@cnab/field/cnab240/boleto-seu-numero-field'
import { Cnab240BoletoUsoDaEmpresaField } from '@cnab/field/cnab240/boleto-uso-da-empresa-field'

export class Cnab240BoletoParcelaField extends CnabField<number> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey: string = 'parcela'
  protected readonly sourceFields: CnabFieldClass<string>[] = [
    Cnab240BoletoUsoDaEmpresaField,
    Cnab240BoletoSeuNumeroField
  ]

  get range(): [number, number] {
    return this.sources()[0].range
  }

  shouldValidate(): boolean {
    return this.sources()[0].shouldValidate()
  }

  protected extractRawValue(): string {
    for (const source of this.sources()) {
      if (!source.shouldValidate()) continue
      const found = source.value == null ? null : findParcela(source.value)
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
    if (!isDigitsOnly(rawValue)) {
      throw new CnabFieldInvalidNumberError(this.fieldKey, rawValue)
    }
    return parseInt(rawValue, 10)
  }

  private sources(): CnabField<string>[] {
    return this.sourceFields.map((SourceField: CnabFieldClass<string>) => new SourceField(this.rawLine, this.lineNumber))
  }
}

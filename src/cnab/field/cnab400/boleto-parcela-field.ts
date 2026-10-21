import { CnabField, CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { findParcela } from '@cnab/utils/parcela-parser'
import { Cnab400BoletoSeuNumeroField } from '@cnab/field/cnab400/boleto-seu-numero-field'
import { Cnab400BoletoUsoDaEmpresaField } from '@cnab/field/cnab400/boleto-uso-da-empresa-field'

export class Cnab400BoletoParcelaField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'parcela'
  protected readonly sourceFields: CnabFieldClass<string>[] = [
    Cnab400BoletoUsoDaEmpresaField,
    Cnab400BoletoSeuNumeroField
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
      const parcela = source.value == null ? null : findParcela(source.value)
      if (parcela != null) return parcela
    }
    return ''
  }

  protected performValidation(): CnabValidationResult {
    return { isValid: true, errors: [] }
  }

  protected parseValue(rawValue: string): string {
    return rawValue
  }

  private sources(): CnabField<string>[] {
    return this.sourceFields.map((SourceField: CnabFieldClass<string>) => new SourceField(this.rawLine, this.lineNumber))
  }
}

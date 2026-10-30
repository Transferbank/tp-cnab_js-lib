import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabDesconto, CnabDescontoRanges } from '@cnab/type/cnab-desconto'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  CnabFieldInvalidDateError,
  CnabFieldInvalidNumberError,
  CnabFieldParseError,
  CnabGenericFieldError
} from '@cnab/type/cnab-validation-error'
import { CnabTipoDeDesconto } from '@cnab/type/cnab-tipo-de-desconto'
import { getDescontoCodes, getTipoDeDesconto } from '@cnab/bank/cnab-tipo-de-desconto-tables'
import { blankIfZeros } from '@cnab/utils/phone-parser'
import { parseImpliedDecimal } from '@cnab/utils/value-parser'

export abstract class CnabDescontosField extends CnabField<CnabDesconto[]> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'descontos'
  protected abstract readonly descontos: CnabDescontoRanges[]
  protected readonly decimals: number = 2

  get range(): [number, number] {
    const positions = this.descontos.flatMap(({ codigo, data, valor }) => [...(codigo ?? []), ...(data ?? []), ...valor])
    return [Math.min(...positions), Math.max(...positions)]
  }

  protected extractRawValue(): string {
    if (this.informedDescontos().length === 0) return ''
    return super.extractRawValue()
  }

  validate(): CnabValidationResult {
    const errors = this.informedDescontos().flatMap(ranges => [
      ...this.formatErrors(ranges.data, range => this.extractData(range)),
      ...this.formatErrors(ranges.valor, range => this.extractValor(range))
    ])
    if (errors.length > 0) {
      return { isValid: false, errors }
    }
    return super.validate()
  }

  protected performValidation(): CnabValidationResult {
    const { bank, format } = this.constructor as typeof CnabField<CnabDesconto[]>
    if (bank == null || format == null) {
      return { isValid: true, errors: [] }
    }

    const codes = getDescontoCodes(bank, format)
    const errors = this.informedDescontos()
      .filter(ranges => ranges.codigo != null)
      .map(ranges => ({ range: ranges.codigo as [number, number], codigo: this.extractCodigo(ranges) }))
      .filter(({ codigo }) => codes != null && codigo != null && codes[codigo] == null)
      .map(({ range, codigo }) => new CnabGenericFieldError({
        message: `Campo código de desconto inválido: código ${codigo} não existe na tabela do banco`,
        lineNumber: this.lineNumber,
        fieldKey: this.fieldKey,
        range
      }))

    return { isValid: errors.length === 0, errors }
  }

  handleDuplicatedValue(previousValue: unknown): CnabDesconto[] {
    return [...(previousValue as CnabDesconto[]), ...(this.value ?? [])]
  }

  protected parseValue(_rawValue: string): CnabDesconto[] {
    return this.informedDescontos().map(ranges => {
      const codigo = this.extractCodigo(ranges)
      return {
        codigo,
        tipo: this.resolveTipo(ranges, codigo),
        data: this.extractData(ranges.data),
        valor: this.extractValor(ranges.valor)
      }
    })
  }

  protected resolveTipo(_ranges: CnabDescontoRanges, codigo: string | null): CnabTipoDeDesconto | null {
    const { bank, format } = this.constructor as typeof CnabField<CnabDesconto[]>
    if (bank == null || format == null) return null
    return getTipoDeDesconto(bank, format, codigo)
  }

  protected abstract parseDate(rawValue: string): Date | null

  protected isInformed(ranges: CnabDescontoRanges): boolean {
    return this.extractCodigo(ranges) != null || this.extractInformed(ranges.valor) != null
  }

  protected extractData(range?: [number, number]): Date | null {
    if (range == null) return null
    const rawValue = this.extractInformed(range)
    if (rawValue == null) return null
    const date = this.parseDate(rawValue)
    if (date == null) {
      throw new CnabFieldInvalidDateError(this.fieldKey, rawValue)
    }
    return date
  }

  protected extractInformed(range: [number, number]): string | null {
    const rawValue = blankIfZeros(this.extractRangeFromLine(range[0] - 1, range[1]))
    return rawValue == '' ? null : rawValue
  }

  private informedDescontos(): CnabDescontoRanges[] {
    return this.descontos.filter(ranges => this.isInformed(ranges))
  }

  private extractCodigo(ranges: CnabDescontoRanges): string | null {
    return ranges.codigo == null ? null : this.extractInformed(ranges.codigo)
  }

  private extractValor(range: [number, number]): number | null {
    const rawValue = this.extractInformed(range)
    if (rawValue == null) return null
    const value = parseImpliedDecimal(rawValue, this.decimals)
    if (value == null) {
      throw new CnabFieldInvalidNumberError(this.fieldKey, rawValue)
    }
    return value
  }

  private formatErrors(range: [number, number] | undefined, extract: (range: [number, number]) => unknown): CnabGenericFieldError[] {
    if (range == null) return []
    try {
      extract(range)
      return []
    } catch (error) {
      if (!(error instanceof CnabFieldParseError)) throw error
      return [new CnabGenericFieldError({
        message: `Campo ${this.fieldKey} com formato inválido: ${error.rawValue}`,
        lineNumber: this.lineNumber,
        fieldKey: this.fieldKey,
        range
      })]
    }
  }
}

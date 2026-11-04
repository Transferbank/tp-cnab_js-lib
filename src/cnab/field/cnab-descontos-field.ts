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
import { getDescontoCodes, getTipoDeDesconto, zeroCodeMeansNoDesconto } from '@cnab/bank/cnab-tipo-de-desconto-tables'
import { blankIfZeros } from '@cnab/utils/phone-parser'
import { parseImpliedDecimal } from '@cnab/utils/value-parser'

export abstract class CnabDescontosField extends CnabField<CnabDesconto[]> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'descontos'
  protected abstract readonly descontos: CnabDescontoRanges[]
  protected readonly decimals: number = 2
  protected readonly emptyDataMeansVencimento: boolean = false
  private readonly tiposWithDataRequired: (CnabTipoDeDesconto | null)[] = [CnabTipoDeDesconto.VALOR_FIXO, CnabTipoDeDesconto.PERCENTUAL]

  get range(): [number, number] {
    return this.descontos[0].valor
  }

  protected extractRawValue(): string {
    return this.informedDescontos().map(ranges => this.extractInformed(ranges.valor)).join(' ')
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

    const errors = [...this.codigoErrors(getDescontoCodes(bank, format)), ...this.dataErrors()]
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
    return this.extractInformed(ranges.valor) != null && !this.hasNoDescontoCode(ranges)
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

  private hasNoDescontoCode(ranges: CnabDescontoRanges): boolean {
    const { bank, format } = this.constructor as typeof CnabField<CnabDesconto[]>
    if (bank == null || format == null || ranges.codigo == null) return false
    return zeroCodeMeansNoDesconto(bank, format) && this.extractRangeFromLine(ranges.codigo[0] - 1, ranges.codigo[1]) == '0'
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

  private codigoErrors(codes: Record<string, CnabTipoDeDesconto> | undefined): CnabGenericFieldError[] {
    return this.informedDescontos()
      .filter(ranges => ranges.codigo != null)
      .map(ranges => ({ range: ranges.codigo as [number, number], codigo: this.extractCodigo(ranges) }))
      .filter(({ codigo }) => codes != null && codigo != null && codes[codigo] == null)
      .map(({ range, codigo }) => new CnabGenericFieldError({
        message: `Campo código de desconto inválido: código ${codigo} não existe na tabela do banco`,
        lineNumber: this.lineNumber,
        fieldKey: this.fieldKey,
        range
      }))
  }

  private dataErrors(): CnabGenericFieldError[] {
    if (this.emptyDataMeansVencimento) return []
    return this.informedDescontos()
      .filter(ranges => ranges.data != null && this.extractData(ranges.data) == null)
      .map(ranges => ({ ranges, codigo: this.extractCodigo(ranges) }))
      .filter(({ ranges, codigo }) => codigo != null && this.tiposWithDataRequired.includes(this.resolveTipo(ranges, codigo)))
      .map(({ ranges, codigo }) => new CnabGenericFieldError({
        message: `Campo data de desconto ausente: o código ${codigo} exige a data limite`,
        lineNumber: this.lineNumber,
        fieldKey: this.fieldKey,
        range: ranges.data as [number, number]
      }))
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

import { describe, it, expect } from '@jest/globals'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabOcorrencia, CnabOcorrenciaTable } from '@cnab/type/cnab-ocorrencia'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { cnab400RetornoLine, replaceLineRange } from '@test/test-utils'
import { ValorTituloBoletoField } from '@cnab/field/cnab400/retorno/valor-titulo-boleto-field'
import { ValorPagoBoletoField } from '@cnab/field/cnab400/retorno/valor-pago-boleto-field'
import { JurosMultaBoletoField } from '@cnab/field/cnab400/retorno/juros-multa-boleto-field'
import { JurosPagoBoletoField } from '@cnab/field/cnab400/retorno/juros-pago-boleto-field'
import { MultaPagaBoletoField } from '@cnab/field/cnab400/retorno/multa-paga-boleto-field'

const OCORRENCIA_TABLE: CnabOcorrenciaTable = {
  [CnabOcorrencia.LIQUIDACAO]: { '06': 'Liquidação' },
  [CnabOcorrencia.BAIXA]: { '09': 'Baixa' }
}

class LiquidacaoOnlyValorPagoBoletoField extends ValorPagoBoletoField {
  protected readonly liquidacaoOnlyTable = OCORRENCIA_TABLE
}

class SummedValorPagoBoletoField extends ValorPagoBoletoField {
  protected readonly addedRanges: Array<[number, number]> = [[176, 188], [280, 292]]
}

const cases: Array<[string, CnabFieldClass<number>, [number, number]]> = [
  ['ValorTituloBoletoField', ValorTituloBoletoField, [153, 165]],
  ['ValorPagoBoletoField', ValorPagoBoletoField, [254, 266]],
  ['JurosMultaBoletoField', JurosMultaBoletoField, [267, 279]],
  ['JurosPagoBoletoField', JurosPagoBoletoField, [267, 279]],
  ['MultaPagaBoletoField', MultaPagaBoletoField, [280, 292]]
]

describe.each(cases)('%s', (_: string, FieldClass: CnabFieldClass<number>, range: [number, number]): void => {
  it('given a filled amount in a detail record when reading then returns it in reais', (): void => {
    // Given
    const field = new FieldClass(replaceLineRange(cnab400RetornoLine('1'), range, '0000000123456'), 1)

    // When
    const shouldValidate = field.shouldValidate()
    const result = field.validate()

    // Then
    expect(shouldValidate).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe(1234.56)
  })

  it('given an amount in reais when formatting and reading it back then returns the same amount', (): void => {
    // Given
    const line = cnab400RetornoLine('1')
    const formatted = new FieldClass(line, 1).formatValue(1234.56)

    // When
    const field = new FieldClass(replaceLineRange(line, range, formatted), 1)

    // Then
    expect(formatted).toBe('0000000123456')
    expect(field.value).toBe(1234.56)
  })
})

describe('ValorBoletoField', (): void => {
  it('given a zeroed amount when reading then it is absent and valid', (): void => {
    // Given
    const field = new ValorPagoBoletoField(replaceLineRange(cnab400RetornoLine('1'), [254, 266], '0000000000000'), 1)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })

  it('given a header record when checking then does not read the field', (): void => {
    // Given
    const field = new ValorPagoBoletoField(cnab400RetornoLine('0'), 1)

    // When
    const shouldValidate = field.shouldValidate()

    // Then
    expect(shouldValidate).toBe(false)
  })

  it('given a non numeric amount when validating then reports an invalid format', (): void => {
    // Given
    const field = new ValorPagoBoletoField(replaceLineRange(cnab400RetornoLine('1'), [254, 266], '00000001234AB'), 1)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({
      isValid: false,
      errors: [
        new CnabGenericFieldError({
          message: 'Campo valor_pago com formato inválido: 00000001234AB',
          lineNumber: 1,
          fieldKey: 'valor_pago',
          range: [254, 266]
        })
      ]
    })
  })
})

describe('ValorPagoBoletoField', (): void => {
  it('given amounts in the added ranges when reading then returns the sum with its own range', (): void => {
    // Given
    let line = replaceLineRange(cnab400RetornoLine('1'), [254, 266], '0000000010000')
    line = replaceLineRange(line, [176, 188], '0000000000250')
    line = replaceLineRange(line, [280, 292], '0000000000005')

    // When
    const field = new SummedValorPagoBoletoField(line, 1)

    // Then
    expect(field.validate()).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe(102.55)
  })

  it('given a non numeric added range when validating then reports an invalid format', (): void => {
    // Given
    let line = replaceLineRange(cnab400RetornoLine('1'), [254, 266], '0000000010000')
    line = replaceLineRange(line, [176, 188], '00000000002AB')

    // When
    const result = new SummedValorPagoBoletoField(line, 1).validate()

    // Then
    expect(result).toEqual({
      isValid: false,
      errors: [
        new CnabGenericFieldError({
          message: 'Campo valor_pago com formato inválido: 00000000002AB',
          lineNumber: 1,
          fieldKey: 'valor_pago',
          range: [254, 266]
        })
      ]
    })
  })

  it.each([
    ['06', true],
    ['09', false]
  ])('given the ocorrência %s when the field is read only on liquidação then shouldValidate is %s', (code: string, expected: boolean): void => {
    // Given
    const line = replaceLineRange(cnab400RetornoLine('1'), [109, 110], code)

    // When
    const shouldValidate = new LiquidacaoOnlyValorPagoBoletoField(line, 1).shouldValidate()

    // Then
    expect(shouldValidate).toBe(expected)
  })
})

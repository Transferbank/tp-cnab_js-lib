import { describe, it, expect } from '@jest/globals'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabOcorrencia, CnabOcorrenciaTable } from '@cnab/type/cnab-ocorrencia'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { cnab400RetornoLine, replaceLineRange } from '@test/test-utils'
import { ValorTituloBoletoField } from '@cnab/field/cnab400/retorno/valor-titulo-boleto-field'
import { ValorPagoBoletoField } from '@cnab/field/cnab400/retorno/valor-pago-boleto-field'
import { JurosMultaBoletoField } from '@cnab/field/cnab400/retorno/juros-multa-boleto-field'

const OCORRENCIA_TABLE: CnabOcorrenciaTable = {
  [CnabOcorrencia.LIQUIDACAO]: { '06': 'Liquidação' },
  [CnabOcorrencia.BAIXA]: { '09': 'Baixa' }
}

class LiquidacaoOnlyValorPagoBoletoField extends ValorPagoBoletoField {
  protected readonly liquidacaoOnlyTable = OCORRENCIA_TABLE
}

const cases: Array<[string, CnabFieldClass<number>, [number, number]]> = [
  ['ValorTituloBoletoField', ValorTituloBoletoField, [153, 165]],
  ['ValorPagoBoletoField', ValorPagoBoletoField, [254, 266]],
  ['JurosMultaBoletoField', JurosMultaBoletoField, [267, 279]]
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

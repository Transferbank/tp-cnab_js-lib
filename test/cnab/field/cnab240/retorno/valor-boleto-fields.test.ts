import { describe, it, expect } from '@jest/globals'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabOcorrencia, CnabOcorrenciaTable } from '@cnab/type/cnab-ocorrencia'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { cnab240RetornoLine, replaceLineRange } from '@test/test-utils'
import { ValorTituloBoletoField } from '@cnab/field/cnab240/retorno/valor-titulo-boleto-field'
import { ValorPagoBoletoField } from '@cnab/field/cnab240/retorno/valor-pago-boleto-field'
import { JurosMultaBoletoField } from '@cnab/field/cnab240/retorno/juros-multa-boleto-field'

const OCORRENCIA_TABLE: CnabOcorrenciaTable = {
  [CnabOcorrencia.LIQUIDACAO]: { '06': 'Liquidação' },
  [CnabOcorrencia.BAIXA]: { '25': 'Protestado e baixado' }
}

class LiquidacaoOnlyValorTituloBoletoField extends ValorTituloBoletoField {
  protected readonly liquidacaoOnlyTable = OCORRENCIA_TABLE
}

class LiquidacaoOnlyValorPagoBoletoField extends ValorPagoBoletoField {
  protected readonly liquidacaoOnlyTable = OCORRENCIA_TABLE
}

class LiquidacaoOnlyJurosMultaBoletoField extends JurosMultaBoletoField {
  protected readonly liquidacaoOnlyTable = OCORRENCIA_TABLE
}

const cases: Array<[string, CnabFieldClass<number>, CnabFieldClass<number>, string, [number, number]]> = [
  ['ValorTituloBoletoField', ValorTituloBoletoField, LiquidacaoOnlyValorTituloBoletoField, 'T', [82, 96]],
  ['ValorPagoBoletoField', ValorPagoBoletoField, LiquidacaoOnlyValorPagoBoletoField, 'U', [78, 92]],
  ['JurosMultaBoletoField', JurosMultaBoletoField, LiquidacaoOnlyJurosMultaBoletoField, 'U', [18, 32]]
]

describe.each(cases)('%s', (_: string, FieldClass: CnabFieldClass<number>, LiquidacaoOnlyFieldClass: CnabFieldClass<number>, segment: string, range: [number, number]): void => {
  it('given a filled amount in its segment when reading then returns it in reais', (): void => {
    // Given
    const field = new FieldClass(replaceLineRange(cnab240RetornoLine('3', segment), range, '000000000123456'), 1)

    // When
    const shouldValidate = field.shouldValidate()
    const result = field.validate()

    // Then
    expect(shouldValidate).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe(1234.56)
  })

  it.each([
    ['06', true],
    ['25', false]
  ])('given the ocorrência %s in its segment when the field is read only on liquidação then shouldValidate is %s', (code: string, expected: boolean): void => {
    // Given
    const line = replaceLineRange(cnab240RetornoLine('3', segment), [16, 17], code)

    // When
    const shouldValidate = new LiquidacaoOnlyFieldClass(line, 1).shouldValidate()

    // Then
    expect(shouldValidate).toBe(expected)
  })
})

describe('ValorBoletoField', (): void => {
  it('given a zeroed amount when reading then it is absent and valid', (): void => {
    // Given
    const field = new ValorPagoBoletoField(replaceLineRange(cnab240RetornoLine('3', 'U'), [78, 92], '000000000000000'), 1)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })

  it('given a line of another segment when checking then does not read the field', (): void => {
    // Given
    const field = new ValorPagoBoletoField(cnab240RetornoLine('3', 'T'), 1)

    // When
    const shouldValidate = field.shouldValidate()

    // Then
    expect(shouldValidate).toBe(false)
  })

  it('given a non numeric amount when validating then reports an invalid format', (): void => {
    // Given
    const field = new ValorPagoBoletoField(replaceLineRange(cnab240RetornoLine('3', 'U'), [78, 92], '0000000001234AB'), 1)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({
      isValid: false,
      errors: [
        new CnabGenericFieldError({
          message: 'Campo valor_pago com formato inválido: 0000000001234AB',
          lineNumber: 1,
          fieldKey: 'valor_pago',
          range: [78, 92]
        })
      ]
    })
  })
})

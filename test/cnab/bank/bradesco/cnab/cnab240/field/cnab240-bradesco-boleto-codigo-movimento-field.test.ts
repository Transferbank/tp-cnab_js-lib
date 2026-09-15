import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import { readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { CnabFieldInvalidNumberError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab240BradescoBoletoCodigoMovimentoField } from '@cnab/bank/bradesco/cnab/cnab240/field/cnab240-bradesco-boleto-codigo-movimento-field'

describe('Cnab240BradescoBoletoCodigoMovimentoField', (): void => {
  const examplePath = 'bradesco/cnab240/bradesco_cnab_240.txt'

  // O arquivo de exemplo do Bradesco nao tem nenhuma linha de segmento Y -
  // e justamente por isso que este campo (opcional) foi escolhido pra
  // exercitar o caminho "nunca preenchido no arquivo real". As linhas Y
  // usadas abaixo sao sinteticas, construidas a partir de uma linha P real.
  function buildSegmentoYLine(codigoMovimento: string): string {
    const lines = readExampleLines(path.join(resPath(), examplePath))
    const rawLine = lines.find(
      (line: string) => line[7] === '3' && line[13] === 'P'
    )

    if (rawLine == null) {
      throw new Error('Linha segmento P não encontrada para servir de base')
    }

    const asSegmentoY = replaceLineRange(rawLine, [14, 14], 'Y')
    const fieldRange = new Cnab240BradescoBoletoCodigoMovimentoField('', 0).range
    return replaceLineRange(asSegmentoY, fieldRange, codigoMovimento)
  }

  describe('shouldValidate', (): void => {
    describe.each([
      { segment: 'P', expectedShouldValidate: false },
      { segment: 'Q', expectedShouldValidate: false },
      { segment: 'R', expectedShouldValidate: false },
      { segment: 'S', expectedShouldValidate: false }
    ])('parameterized cases', ({ segment, expectedShouldValidate }): void => {
      it(`given segment ${segment} when checking shouldValidate then returns ${expectedShouldValidate}`, (): void => {
        // Given
        const lines = readExampleLines(path.join(resPath(), examplePath))
        const rawLine = lines.find(
          (line: string) => line[7] === '3' && line[13] === segment
        )

        if (rawLine == null) {
          throw new Error(`Linha com segmento ${segment} não encontrada`)
        }

        const field = new Cnab240BradescoBoletoCodigoMovimentoField(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })

    it('given the real example file when looking for segment Y lines then finds none', (): void => {
      // Given
      const lines = readExampleLines(path.join(resPath(), examplePath))

      // When
      const segmentoYLines = lines.filter((line: string) => {
        const field = new Cnab240BradescoBoletoCodigoMovimentoField(line, 1)
        return field.shouldValidate()
      })

      // Then
      expect(segmentoYLines).toHaveLength(0)
    })

    it('given a synthetic segment Y line when checking shouldValidate then returns true', (): void => {
      // Given
      const rawLine = buildSegmentoYLine('01')

      // When
      const field = new Cnab240BradescoBoletoCodigoMovimentoField(rawLine, 1)

      // Then
      expect(field.shouldValidate()).toBe(true)
    })
  })

  describe('value and validate', (): void => {
    it('given a synthetic segment Y line with valid movement code when reading value and validating then accepts it', (): void => {
      // Given
      const rawLine = buildSegmentoYLine('01')

      // When
      const field = new Cnab240BradescoBoletoCodigoMovimentoField(rawLine, 37)
      const result = field.validate()

      // Then
      expect(field.value).toBe(1)
      expect(result).toEqual(genValidCnabValidationResult())
    })
  })

  describe('validate as optional', (): void => {
    it('given a synthetic segment Y line with blank movement code when validating then accepts it as optional', (): void => {
      // Given
      const rawLine = buildSegmentoYLine('')

      // When
      const field = new Cnab240BradescoBoletoCodigoMovimentoField(rawLine, 37)
      const result = field.validate()

      // Then
      expect(field.value).toBeNull()
      expect(result).toEqual(genValidCnabValidationResult())
    })

    it('given a synthetic segment Y line with malformed movement code when validating then does not silently accept it as blank', (): void => {
      // Given
      const rawLine = buildSegmentoYLine('AB')

      // When / Then
      const field = new Cnab240BradescoBoletoCodigoMovimentoField(rawLine, 37)

      // Campo opcional significa "pode estar em branco", nao "pode conter lixo":
      // conteudo presente porem malformado deve reportar erro, mesmo sendo opcional.
      expect(() => field.value).toThrow(CnabFieldInvalidNumberError)
      expect(field.validate().isValid).toBe(false)
    })
  })
})

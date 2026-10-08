import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { findFirstCnab240SegmentLine, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab240BoletoEmailField } from '@cnab/field/cnab240/boleto-email-field'
import { Cnab240CaixaBoletoEmailField } from '@cnab/bank/caixa/cnab/cnab240/field/fields'
import { Cnab240BradescoBoletoEmailField } from '@cnab/bank/bradesco/cnab/cnab240/field/fields'
import { Cnab240BancoDoBrasilBoletoEmailField, Cnab240BancoDoBrasilBoletoEmailSegmentoYField } from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/fields'

// Os testes partem das linhas reais dos arquivos de exemplo. Os casos inválidos trocam só o
//  campo testado, porque os arquivos de exemplo só têm dados válidos.
const findFirstSegment = (examplePath: string, segment: string): string => {
  const line = findFirstCnab240SegmentLine(readExampleLines(path.join(resPath(), examplePath)), segment)
  assert(line != null, `Linha com segmento ${segment} não encontrada em ${examplePath}`)
  return line
}

// Pelo padrão FEBRABAN, o campo traz um único e-mail. Só o Banco do Brasil aceita mais de um, separados por ';'.
describe.each([
  ['Cnab240BradescoBoletoEmailField (segment Y-04, code 03)', Cnab240BradescoBoletoEmailField, 'bradesco/cnab240/bradesco_cnab_240.txt', 'financeiro@comercialexemplo.com.br', '04'],
  ['Cnab240CaixaBoletoEmailField (segment Y-04, code 04)', Cnab240CaixaBoletoEmailField, 'caixa/cnab240/caixa_cnab_240.txt', 'maria.souza@exemplo.com', '03']
])('%s', (_: string, EmailField: typeof Cnab240BoletoEmailField, examplePath: string, expectedEmail: string, otherBankCode: string): void => {
  const segmentoY = findFirstSegment(examplePath, 'Y')

  it('given segment Y-04 from the example file when reading then returns its e-mail', (): void => {
    // Given
    const field = new EmailField(segmentoY, 5)

    // When
    const shouldValidate = field.shouldValidate()
    const result = field.validate()

    // Then
    expect(shouldValidate).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe(expectedEmail)
  })

  it('given e-mails separated by semicolon when validating then reports it as an invalid e-mail', (): void => {
    // Given
    const field = new EmailField(replaceLineRange(segmentoY, [20, 69], 'joao@exemplo.com;maria@exemplo.com'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({
      isValid: false,
      errors: [new CnabGenericFieldError({
        message: 'Campo email do sacado inválido: joao@exemplo.com;maria@exemplo.com não é um e-mail',
        lineNumber: 5,
        fieldKey: 'email_do_sacado',
        range: [20, 69]
      })]
    })
  })

  it.each([
    ['segment Y-04 of another bank code', replaceLineRange(segmentoY, [18, 19], otherBankCode)],
    ['segment Q', findFirstSegment(examplePath, 'Q')]
  ])('given %s when checking shouldValidate then returns false', (_: string, line: string): void => {
    // When
    const shouldValidate = new EmailField(line, 5).shouldValidate()

    // Then
    expect(shouldValidate).toBe(false)
  })
})

describe('Cnab240BancoDoBrasilBoletoEmailField (segment S, print type 8, accepts e-mails separated by semicolon)', (): void => {
  const segmentoS = findFirstSegment('banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt', 'S')

  it('given segment S from the example file when reading then returns each e-mail', (): void => {
    // Given
    const field = new Cnab240BancoDoBrasilBoletoEmailField(segmentoS, 11)

    // When
    const shouldValidate = field.shouldValidate()
    const result = field.validate()

    // Then
    expect(shouldValidate).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toEqual(['maria.souza@exemplo.com', 'financeiro@exemplo.com'])
  })

  it('given e-mails with a trailing semicolon when reading then ignores it', (): void => {
    // Given
    const field = new Cnab240BancoDoBrasilBoletoEmailField(replaceLineRange(segmentoS, [21, 160], 'joao@exemplo.com;maria@exemplo.com;'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toEqual(['joao@exemplo.com', 'maria@exemplo.com'])
  })

  it.each([
    ['without @', 'joao@exemplo.com;joao.exemplo.com', 'joao.exemplo.com'],
    ['after a space, which the manual does not allow between e-mails', 'joao@exemplo.com; joao@exemplo.com', ' joao@exemplo.com']
  ])('given an e-mail %s in the list when validating then reports it', (_: string, emails: string, invalidEmail: string): void => {
    // Given
    const field = new Cnab240BancoDoBrasilBoletoEmailField(replaceLineRange(segmentoS, [21, 160], emails), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({
      isValid: false,
      errors: [new CnabGenericFieldError({
        message: `Campo email do sacado inválido: ${invalidEmail} não é um e-mail`,
        lineNumber: 5,
        fieldKey: 'email_do_sacado',
        range: [21, 160]
      })]
    })
  })
})

// No Banco do Brasil, o segmento Y-04 usa o tipo de registro '4' na posição 8, e não o '3' do padrão FEBRABAN.
describe('Cnab240BancoDoBrasilBoletoEmailSegmentoYField (segment Y-04 with record type 4)', (): void => {
  const segmentoY = readExampleLines(path.join(resPath(), 'banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt'))
    .find((line: string) => line[13] == 'Y')
  assert(segmentoY != null, 'Linha com segmento Y não encontrada')

  it('given segment Y-04 from the example file when reading then returns its e-mail', (): void => {
    // Given
    const field = new Cnab240BancoDoBrasilBoletoEmailSegmentoYField(segmentoY, 12)

    // When
    const shouldValidate = field.shouldValidate()
    const result = field.validate()

    // Then
    expect(shouldValidate).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toEqual(['cobranca@exemplo.com'])
  })

  it('given segment Y-04 with the FEBRABAN record type 3 when checking shouldValidate then returns false', (): void => {
    // Given
    const field = new Cnab240BancoDoBrasilBoletoEmailSegmentoYField(replaceLineRange(segmentoY, [8, 8], '3'), 12)

    // When
    const shouldValidate = field.shouldValidate()

    // Then
    expect(shouldValidate).toBe(false)
  })
})

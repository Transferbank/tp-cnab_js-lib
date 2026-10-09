import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { findFirstCnab400RecordLine, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab400BoletoEmailField } from '@cnab/field/cnab400/boleto-email-field'
import { Cnab400ItauBoletoEmailField } from '@cnab/bank/itau/cnab/cnab400/field/fields'
import { Cnab400CaixaBoletoEmailField } from '@cnab/bank/caixa/cnab/cnab400/field/fields'
import { Cnab400BancoDoBrasilBoletoEmailField } from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/fields'

// Os testes partem das linhas reais dos arquivos de exemplo. Os casos inválidos trocam só o
//  campo testado, porque os arquivos de exemplo só têm dados válidos.
const findRecord = (examplePath: string, recordType: string): string => {
  const line = findFirstCnab400RecordLine(readExampleLines(path.join(resPath(), examplePath)), recordType)
  assert(line != null, `Registro ${recordType} não encontrado em ${examplePath}`)
  return line
}

// No CNAB400, o campo traz um único e-mail. Só o Banco do Brasil aceita mais de um, separados por ';'.
describe.each([
  ['Cnab400CaixaBoletoEmailField (record 3)', Cnab400CaixaBoletoEmailField, findRecord('caixa/cnab400/caixa_cnab_400.REM', '3'), [54, 103], 'leticia.modelo@exemplo.com'],
  ['Cnab400ItauBoletoEmailField (record 5)', Cnab400ItauBoletoEmailField, findRecord('itau/cnab400/ITAU_cnab_400.REM', '5'), [2, 121], 'compras@materiaisomega.com.br']
])('%s', (_: string, EmailField: typeof Cnab400BoletoEmailField, registro: string, range: number[], expectedEmail: string): void => {
  const emailRange = range as [number, number]

  it('given the record from the example file when reading then returns its e-mail', (): void => {
    // Given
    const field = new EmailField(registro, 5)

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
    const field = new EmailField(replaceLineRange(registro, emailRange, 'joao@exemplo.com;maria@exemplo.com'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({
      isValid: false,
      errors: [new CnabGenericFieldError({
        message: 'Campo email do sacado inválido: joao@exemplo.com;maria@exemplo.com não é um e-mail',
        lineNumber: 5,
        fieldKey: 'email_do_sacado',
        range: emailRange
      })]
    })
  })
})

describe('Cnab400BancoDoBrasilBoletoEmailField (record 5, service type 01, accepts e-mails separated by semicolon)', (): void => {
  const registro5Multa = findRecord('banco-do-brasil/cnab400/banco_do_brasil_cnab_400.REM', '599')

  it('given record 5 with service type 01 from the example file when reading then returns each e-mail', (): void => {
    // Given
    const registro5Email = findRecord('banco-do-brasil/cnab400/banco_do_brasil_cnab_400.REM', '501')
    const field = new Cnab400BancoDoBrasilBoletoEmailField(registro5Email, 227)

    // When
    const shouldValidate = field.shouldValidate()
    const result = field.validate()

    // Then
    expect(shouldValidate).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toEqual(['contato@variedadesgama.com.br', 'financeiro@variedadesgama.com.br'])
  })

  it('given record 5 with service type 99 (multa) when checking shouldValidate then returns false', (): void => {
    // When
    const shouldValidate = new Cnab400BancoDoBrasilBoletoEmailField(registro5Multa, 5).shouldValidate()

    // Then
    expect(shouldValidate).toBe(false)
  })
})

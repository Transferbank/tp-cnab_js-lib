import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { findFirstCnab240SegmentLine, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab240BoletoEmailField } from '@cnab/field/cnab240/boleto-email-field'
import { Cnab240BancoDoBrasilBoletoEmailField } from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/fields'


//Uma linha Q será transformada em segmento opcional para testes,
// adicionar os segmentos nos arquivos teste quebraria outros testes
// será deixado para outra PR
const segmentoQ = findFirstCnab240SegmentLine(readExampleLines(path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt')), 'Q')
assert(segmentoQ != null, 'Linha com segmento Q não encontrada')
const toLine = (segment: string, code: string, emailRange: [number, number], email: string): string =>
  replaceLineRange(replaceLineRange(replaceLineRange(segmentoQ, [14, 14], segment), [18, 19], code), emailRange, email)

describe('Cnab240BoletoEmailField', (): void => {
  it('given segment Y-04 with an e-mail when reading then returns it as a single item list', (): void => {
    // Given
    const field = new Cnab240BoletoEmailField(toLine('Y', '03', [20, 69], 'joao@exemplo.com'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toEqual(['joao@exemplo.com'])
  })

  it('given segment Y-04 with e-mails separated by semicolon when validating then reports it, since only Banco do Brasil accepts more than one e-mail', (): void => {
    // Given
    const field = new Cnab240BoletoEmailField(toLine('Y', '03', [20, 69], 'joao@exemplo.com;maria@exemplo.com'), 5)

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
    ['segment Y-04 with another code', toLine('Y', '04', [20, 69], 'joao@exemplo.com')],
    ['segment Q', segmentoQ]
  ])('given %s when checking shouldValidate then returns false', (_: string, line: string): void => {
    // When
    const shouldValidate = new Cnab240BoletoEmailField(line, 5).shouldValidate()

    // Then
    expect(shouldValidate).toBe(false)
  })
})

describe('Cnab240BancoDoBrasilBoletoEmailField', (): void => {
  it('given segment S with print type 8 and e-mails separated by semicolon when reading then returns each e-mail', (): void => {
    // Given
    const field = new Cnab240BancoDoBrasilBoletoEmailField(toLine('S', '8', [21, 160], 'joao@exemplo.com; maria@exemplo.com;'), 5)

    // When
    const shouldValidate = field.shouldValidate()
    const result = field.validate()

    // Then
    expect(shouldValidate).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toEqual(['joao@exemplo.com', 'maria@exemplo.com'])
  })

  it('given segment S with print type 8 and an invalid e-mail in the list when validating then reports it', (): void => {
    // Given
    const field = new Cnab240BancoDoBrasilBoletoEmailField(toLine('S', '8', [21, 160], 'joao@exemplo.com;joao.exemplo.com'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({
      isValid: false,
      errors: [new CnabGenericFieldError({
        message: 'Campo email do sacado inválido: joao.exemplo.com não é um e-mail',
        lineNumber: 5,
        fieldKey: 'email_do_sacado',
        range: [21, 160]
      })]
    })
  })
})

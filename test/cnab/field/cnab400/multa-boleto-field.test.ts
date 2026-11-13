import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import { readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { MultaBoletoField } from '@cnab/bank/sicredi/cnab/cnab400/field/multa-boleto-field'

describe('MultaBoletoField', (): void => {
  const detailLines = readExampleLines(path.join(resPath(), 'sicredi/cnab400/sicredi_cnab_400.REM'))
    .filter((line: string) => line[0] == '1')

  it.each([
    ['a percentual multa', '', [93, 96], 'ABCD'],
    ['a valor monetário multa', 'A', [97, 108], 'ABCDEFGHIJKL']
  ] as Array<[string, string, [number, number], string]>)('given sicredi cnab400 boleto with %s and an invalid value when validating then reports the range it was read from', (_: string, codigo: string, range: [number, number], invalidValue: string): void => {
    // Given
    const line = replaceLineRange(replaceLineRange(detailLines[0], [20, 20], codigo), range, invalidValue)
    const field = new MultaBoletoField(line, 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({
      isValid: false,
      errors: [
        new CnabGenericFieldError({
          message: `Campo multa com formato inválido: ${invalidValue}`,
          lineNumber: 5,
          fieldKey: 'multa',
          range
        })
      ]
    })
  })
})

import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { findFirstCnab400RecordLine, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { DescontosBoletoField } from '@cnab/field/cnab400/descontos-boleto-field'

class SicoobDescontosBoletoField extends DescontosBoletoField {
  static readonly bank = CnabBank.SICOOB
  static readonly format = CnabFormat.CNAB400
}

describe('DescontosBoletoField', (): void => {
  it('given a layout without code and a desconto without date when validating then reports the error at the range of the date', (): void => {
    // Given
    const line = findFirstCnab400RecordLine(readExampleLines(path.join(resPath(), 'sicoob/cnab400/sicoob_cnab_400.REM')), '1')
    assert(line != null, 'Linha não encontrada')
    const field = new SicoobDescontosBoletoField(replaceLineRange(line, [174, 192], '000000' + '0000000000500'), 2)

    // When
    const result = field.validate()

    // Then
    expect(result.isValid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toMatchObject({ fieldKey: 'descontos', range: [174, 179] })
  })
})

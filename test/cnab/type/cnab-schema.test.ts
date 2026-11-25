import { describe, it, expect } from '@jest/globals'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabField, CnabNumberedLine } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabSchema } from '@cnab/type/cnab-schema'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { Cnab400BoletoGroupRule } from '@cnab/group-rule/cnab400/boleto-group-rule'

class FakeGroupField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  static readonly validatesInGroup = true
  readonly fieldKey = 'campo_do_boleto'
  readonly range: [number, number] = [2, 4]

  shouldValidate(): boolean {
    return this.rawLine.startsWith('1')
  }

  readInGroup(group: CnabNumberedLine[]): string | null {
    const hasSecondRecord = group.some(([, rawLine]) => rawLine.startsWith('2'))
    return hasSecondRecord ? this.value : null
  }

  protected parseValue(rawValue: string): string {
    return rawValue
  }

  protected performValidation(): CnabValidationResult {
    return { isValid: true, errors: [] }
  }
}

function schemaWithGroupField(): CnabSchema {
  return new CnabSchema({
    bank: CnabBank.BRADESCO,
    fmt: CnabFormat.CNAB400,
    boletoGroupRule: new Cnab400BoletoGroupRule(),
    header: { fieldType: CnabFieldType.HEADER, fields: [] },
    trailer: { fieldType: CnabFieldType.TRAILER, fields: [] },
    boleto: { fieldType: CnabFieldType.BOLETO, fields: [FakeGroupField] }
  })
}

describe('CnabSchema', (): void => {
  it('given a field read in group when extracting then reads it with the lines of its own boleto', (): void => {
    // Given
    const rawLines = ['0', '1AAA', '2', '1BBB', '9']

    // When
    const cnab = schemaWithGroupField().extractCnab(rawLines)

    // Then
    expect(cnab.boletos.map(boleto => boleto.fields)).toEqual([{ campo_do_boleto: 'AAA' }])
  })
})

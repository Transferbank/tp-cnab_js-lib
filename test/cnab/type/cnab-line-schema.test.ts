import { describe, it, expect } from '@jest/globals'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabField, CnabNumberedLine } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabLineSchema } from '@cnab/type/cnab-line-schema'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab400BoletoGroupRule } from '@cnab/group-rule/cnab400/boleto-group-rule'
import { Cnab240BoletoGroupRule } from '@cnab/group-rule/cnab240/boleto-group-rule'

class FakeSecondRecordField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'segundo_registro'
  readonly range: [number, number] = [2, 4]

  shouldValidate(): boolean {
    return this.rawLine.startsWith('2')
  }

  protected parseValue(rawValue: string): string {
    return rawValue
  }

  protected performValidation(): CnabValidationResult {
    return { isValid: true, errors: [] }
  }
}

class FakeGroupField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  static readonly resolvesInGroup = true
  readonly fieldKey = 'campo_do_boleto'
  readonly range: [number, number] = [1, 1]

  shouldValidate(): boolean {
    return this.rawLine.startsWith('1')
  }

  validateInGroup(lines: CnabNumberedLine[], _lineResult: CnabValidationResult): CnabValidationResult {
    const secondRecord = this.readFieldInGroup(lines, FakeSecondRecordField)
    return this.errorResult(`segundo registro do boleto: ${secondRecord ?? 'ausente'}`)
  }

  protected parseValue(rawValue: string): string {
    return rawValue
  }

  protected performValidation(): CnabValidationResult {
    return this.errorResult('validado na linha')
  }

  private errorResult(message: string): CnabValidationResult {
    return {
      isValid: false,
      errors: [new CnabGenericFieldError({ message, lineNumber: this.lineNumber, fieldKey: this.fieldKey, range: this.range })]
    }
  }
}

function boletoSchema(): CnabLineSchema {
  return CnabLineSchema.create({
    bank: CnabBank.BRADESCO,
    fmt: CnabFormat.CNAB400,
    boletoGroupRule: new Cnab400BoletoGroupRule(),
    fieldType: CnabFieldType.BOLETO,
    fields: [FakeGroupField]
  })
}

function cnab240Line(recordType: string, segment: string = ' '): string {
  return `0010001${recordType}00001${segment}`.padEnd(240, ' ')
}

describe('CnabLineSchema', (): void => {
  it('given cnab240 lines with two batches when grouping then keeps the batch header and trailer out of the boletos', (): void => {
    // Given
    const rawLines = [
      cnab240Line('1'),
      cnab240Line('3', 'P'),
      cnab240Line('3', 'Q'),
      cnab240Line('5'),
      cnab240Line('1'),
      cnab240Line('3', 'P'),
      cnab240Line('5')
    ]
    const schema = CnabLineSchema.create({
      bank: CnabBank.BANCODOBRASIL,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240BoletoGroupRule(),
      fieldType: CnabFieldType.BOLETO,
      fields: []
    })

    // When
    const groups = [...schema.genLineGroups(rawLines, 1)]

    // Then
    const groupLineNumbers = groups.map(group => group.map(line => line.lineNumber))
    expect(groupLineNumbers).toEqual([[1], [2, 3], [4], [5], [6], [7]])
  })

  it('given a field resolved in group when validating then the group decides the result with the lines of its own boleto', (): void => {
    // Given
    const rawLines = ['1'.padEnd(400, ' '), '2AAA'.padEnd(400, ' '), '1'.padEnd(400, ' ')]

    // When
    const result = boletoSchema().validate(rawLines, false, 1, [])

    // Then
    expect(result.isValid).toBe(false)
    expect(result.errors).toMatchObject([
      { message: 'segundo registro do boleto: AAA', lineNumber: 1 },
      { message: 'segundo registro do boleto: ausente', lineNumber: 3 }
    ])
  })
})

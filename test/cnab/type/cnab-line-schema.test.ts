import { describe, it, expect } from '@jest/globals'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabGroupReader, CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabLineSchema } from '@cnab/type/cnab-line-schema'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab400BoletoGroupRule } from '@cnab/group-rule/cnab400/boleto-group-rule'

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
  static readonly dependencies = [FakeSecondRecordField]
  readonly fieldKey = 'campo_do_boleto'
  readonly range: [number, number] = [1, 1]

  shouldValidate(): boolean {
    return this.rawLine.startsWith('1')
  }

  validateInGroup(group: CnabGroupReader): CnabValidationResult {
    const secondRecord = group.read(FakeSecondRecordField)
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

describe('CnabLineSchema', (): void => {
  it('given a field that depends on another field when validating then reads it only in its own boleto', (): void => {
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

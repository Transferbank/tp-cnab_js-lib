import * as fs from 'fs'
import { CnabField } from '@cnab/type/cnab-field'

export function readExampleLines(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'latin1')
  return content.split(/\r?\n/).filter(line => line.length > 0)
}

export function replaceLineRange(
  rawLine: string,
  fieldRange: [number, number],
  value: string
): string {
  const start = fieldRange[0] - 1
  const stop = fieldRange[1]
  const fieldSize = stop - start
  const paddedValue = value.padEnd(fieldSize, ' ').substring(0, fieldSize)  
  return rawLine.substring(0, start) + paddedValue + rawLine.substring(stop)
}

export function findFirstCnab240SegmentLine(
  lines: string[],
  segment: string
): string | undefined {
  return lines.find(
    (line: string) => line.length >= 14 && line[7] === '3' && line[13] === segment
  )
}

export function findFirstCnab400RecordLine(
  lines: string[],
  recordType: string
): string | undefined {
  return lines.find((line: string) => line.startsWith(recordType))
}

export function filterValidatableLines<T extends typeof CnabField>(
  lines: string[],
  FieldClass: T
): Array<{ rawLine: string; lineNumber: number }> {
  return lines
    .map((line: string, lineNumber: number) => ({ rawLine: line, lineNumber }))
    .filter(({ rawLine }: { rawLine: string }) => 
      FieldClass.shouldValidate(rawLine)
    )
}

export function getFieldRange<T extends typeof CnabField>(
  FieldClass: T
): [number, number] {
  const Constructor = FieldClass as unknown as new (config: { rawLine: string; lineNumber: number }) => CnabField
  const instance = new Constructor({ rawLine: '', lineNumber: 0 })
  return instance.range
}

export function createFieldsFromValidatableLines<T extends CnabField>(
  lines: string[],
  FieldClass: new (config: { rawLine: string; lineNumber: number }) => T
): T[] {
  const validatableLines = filterValidatableLines(lines, FieldClass.constructor as typeof CnabField)
  return validatableLines.map(({ rawLine, lineNumber }: { rawLine: string; lineNumber: number }) => 
    new FieldClass({ rawLine, lineNumber })
  )
}

export function createFieldsFromLines<T extends CnabField>(
  lines: Array<{ rawLine: string; lineNumber: number }>,
  FieldClass: new (config: { rawLine: string; lineNumber: number }) => T
): T[] {
  return lines.map(({ rawLine, lineNumber }) => 
    new FieldClass({ rawLine, lineNumber })
  )
}

export function validateAllFields<T extends CnabField>(fields: T[]): boolean {
  const results = fields.map((field: T) => field.validate())
  return results.every((result) => result.isValid && result.errors.length === 0)
}

export function expectValidCnabField<T extends CnabField>(
  field: T,
  expectedParsedValue: string
): void {
  expect(field.parse()).toBe(expectedParsedValue)
  expect(field.value).toBe(expectedParsedValue)
}

export function expectInvalidCnabField(
  result: { isValid: boolean; errors: Array<{ message: string; lineNumber: number }> },
  expectedErrorMessage: string,
  expectedLineNumber: number,
  ErrorClass: any
): void {
  expect(result.isValid).toBe(false)
  expect(result.errors).toHaveLength(1)
  expect(result.errors[0]).toBeInstanceOf(ErrorClass)
  expect(result.errors[0].message).toBe(expectedErrorMessage)
  expect(result.errors[0].lineNumber).toBe(expectedLineNumber)
}

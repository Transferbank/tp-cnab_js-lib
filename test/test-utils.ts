import * as fs from 'fs'
import * as path from 'path'
import { CnabField } from '@cnab/type/cnab-field'

type CnabFieldConstructor<T extends CnabField<unknown> = CnabField<unknown>> =
  new (rawLine: string, lineNumber: number) => T

export class TestFixtureNotFoundException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TestFixtureNotFoundException'
  }
}

export function assertDefined<T>(value: T | null | undefined, message: string): asserts value is T {
  if (value == null) {
    throw new TestFixtureNotFoundException(message)
  }
}

export function resPath(): string {
  return path.join(process.cwd(), 'res')
}

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

export function findFirstCnab240SegmentLine(lines: string[], segment: string): string | undefined {
  return lines.find(line => line.length >= 14 && line[7] === '3' && line[13] === segment)
}

export function findFirstCnab400RecordLine(lines: string[], recordType: string): string | undefined {
  return lines.find(line => line.length >= 1 && line[0] === recordType)
}

export function realLineNumber(lines: string[], rawLine: string): number {
  return lines.indexOf(rawLine) + 1
}

export function filterValidatableLines<T extends CnabField<unknown>>(
  lines: string[],
  FieldClass: CnabFieldConstructor<T>
): string[] {
  return lines.filter(line => new FieldClass(line, 1).shouldValidate())
}

export function createFieldsFromLines<T extends CnabField<unknown>>(
  lines: string[],
  FieldClass: CnabFieldConstructor<T>
): T[] {
  return lines.map((line, index) => new FieldClass(line, index + 1))
}

export function getFieldRange(FieldClass: CnabFieldConstructor): [number, number] {
  return new FieldClass(''.padEnd(400, ' '), 1).range
}
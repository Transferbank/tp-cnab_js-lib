import * as fs from 'fs'
import * as path from 'path'
import assert from 'node:assert'
import { CnabField, CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'

export type FieldTestCase = [
  string,
  CnabFieldClass<string>,
  string,
  string,
  string
]

type CnabFieldConstructor<T extends CnabField<unknown> = CnabField<unknown>> =
  new (rawLine: string, lineNumber: number) => T

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
  return lines.find(line => line.startsWith(recordType))
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

export function findFieldClass(
  fields: CnabFieldClass[],
  bank: CnabBank,
  format: CnabFormat,
  index = 0
): CnabFieldClass<string> {
  const fieldClass = fields.filter((field: CnabFieldClass) => field.bank == bank && field.format == format)[index]
  assert(fieldClass != null, `Campo ${index} de ${bank} ${format} não encontrado na lista`)
  return fieldClass as CnabFieldClass<string>
}

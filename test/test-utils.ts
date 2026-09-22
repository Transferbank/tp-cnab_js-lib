import * as fs from 'fs'
import * as path from 'path'
import { expect } from '@jest/globals'
import type { SyncExpectationResult } from 'expect'
import { CnabField } from '@cnab/type/cnab-field'

type CnabFieldConstructor<T extends CnabField<unknown> = CnabField<unknown>> =
  new (rawLine: string, lineNumber: number) => T

declare module 'expect' {
  interface Matchers<R> {
    toBeDefinedWithMessage(message: string): R
  }
}

// Matcher nativo do Jest com mensagem customizada - expect() do Jest nao
// aceita um segundo parametro de mensagem como assert()/chai, entao isso
// precisa ser um matcher registrado via expect.extend().
expect.extend({
  toBeDefinedWithMessage(received: unknown, message: string): SyncExpectationResult {
    const pass = received !== null && received !== undefined
    return { pass, message: () => message }
  }
})

export class TestFixtureNotFoundException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TestFixtureNotFoundException'
  }
}

// So estreita o tipo pro TypeScript (elimina o '!' depois); a mensagem
// descritiva de qual fixture nao foi encontrada fica a cargo do
// expect(...).toBeDefinedWithMessage(...) chamado antes.
export function assertDefined<T>(value: T | null | undefined): asserts value is T {
  if (value == null) {
    throw new TestFixtureNotFoundException('Valor esperado não pode ser nulo ou indefinido')
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
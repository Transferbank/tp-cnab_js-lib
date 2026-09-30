import * as fs from 'fs'
import * as path from 'path'
import { CnabField } from '@cnab/type/cnab-field'

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
  return lines.find(line => line.length >= 1 && line[0] === recordType)
}

// Renumera os detalhes de cada lote (posições 9-13) a partir de 1. Usado depois de
// inserir ou apagar linhas num exemplo, para o cenário não ganhar erros de sequência
export function renumberCnab240Records(lines: string[]): string[] {
  let sequence = 0
  return lines.map((line: string) => {
    if (line[7] !== '3') {
      sequence = 0
      return line
    }
    sequence++
    return replaceLineRange(line, [9, 13], String(sequence).padStart(5, '0'))
  })
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
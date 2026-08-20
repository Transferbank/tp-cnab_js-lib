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

export function findCnab240SegmentLine(
  lines: string[],
  segment: string
): string | undefined {
  return lines.find(
    (line: string) => line.length >= 14 && line[7] === '3' && line[13] === segment
  )
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

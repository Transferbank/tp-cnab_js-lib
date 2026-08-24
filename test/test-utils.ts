import * as fs from 'fs'


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
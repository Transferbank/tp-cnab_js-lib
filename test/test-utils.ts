import * as fs from 'fs'


export function readExampleLines(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'latin1')
  return content.split(/\r?\n/).filter(line => line.length > 0)
}

export function replaceLineRange(
  rawLine: string,
  range: [number, number],
  value: string
): string {
  const start = range[0] - 1
  const stop = range[1]
  const fieldSize = stop - start
  const paddedValue = value.padEnd(fieldSize, ' ').substring(0, fieldSize)  
  return rawLine.substring(0, start) + paddedValue + rawLine.substring(stop)
}

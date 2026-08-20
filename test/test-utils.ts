import * as fs from 'fs'
import * as path from 'path'
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

/**
 * Lê linhas de exemplo de um caminho relativo ao diretório res/
 * 
 * @param resPathFn - Função que retorna o caminho do diretório res/
 * @param relativePath - Caminho relativo, ex: 'bradesco/cnab240/bradesco_cnab_240.txt'
 * @returns Array de linhas não vazias
 * 
 * @example
 * const lines = readLinesFrom(resPath, 'bradesco/cnab240/bradesco_cnab_240.txt')
 */
export function readLinesFrom(resPathFn: () => string, relativePath: string): string[] {
  return readExampleLines(path.join(resPathFn(), relativePath))
}

/**
 * Encontra linha CNAB240 com segmento específico (P, Q, R, S)
 */
export function findCnab240SegmentLine(
  lines: string[],
  segment: string
): string | undefined {
  return lines.find(
    (line: string) => line.length >= 14 && line[7] === '3' && line[13] === segment
  )
}

/**
 * Filtra linhas que devem ser validadas por um campo específico
 */
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

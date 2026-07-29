/**
 * Helpers compartilhados para testes do Bradesco CNAB 240
 */

import * as fs from 'fs'
import * as path from 'path'

export const FIXTURES_DIR = path.join(__dirname, '../../__fixtures__/cnab240')

/**
 * Lê arquivo fixture
 */
export function readFixture(filename: string): string[] {
  const filePath = path.join(FIXTURES_DIR, filename)
  const content = fs.readFileSync(filePath, 'latin1')
  return content.split(/\r?\n/).filter(line => line.length > 0)
}

/**
 * Filtra as linhas de um arquivo CNAB 240 que pertencem a um segmento de detalhe
 * específico (P, Q, R, S, ...), identificando pelo conteúdo da linha (posição 8 = '3'
 * e posição 14 = letra do segmento) em vez de por índice fixo. Isso continua funcionando
 * mesmo que outros segmentos (Header de Lote, R, S, Trailer de Lote) sejam inseridos
 * entre os registros de detalhe.
 */
export function findSegmentLines(lines: string[], segmento: string): string[] {
  return lines.filter((line) => line.length === 240 && line.charAt(7) === '3' && line.charAt(13) === segmento)
}

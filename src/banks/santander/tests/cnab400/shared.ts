import * as fs from 'fs'
import * as path from 'path'

export const FIXTURES_DIR = path.join(__dirname, '../../docs/cnab400')

export function readFixture(filename: string): string[] {
  const filePath = path.join(FIXTURES_DIR, filename)
  const content = fs.readFileSync(filePath, 'latin1')
  return content.split(/\r?\n/).filter((line) => line.length > 0)
}

// Re-exporta isValidCpfCnpj do módulo de utils
export { isValidCpfCnpj } from '@utils/string-utils'

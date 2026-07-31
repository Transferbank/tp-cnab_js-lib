import { readFileSync } from 'fs'
import { join } from 'path'
import { CNABEmptyFileError } from '@tp-types/errors'

export function createFileFromString(content: string, filename = 'test.rem'): File {
  const encoder = new TextEncoder()
  const bytes = encoder.encode(content)
  return new File([bytes], filename, { type: 'text/plain' })
}

export function stringToLines(content: string): string[] {
  const lines = content.split(/\r?\n/).filter((line) => line.length > 0)
  
  if (lines.length === 0) {
    throw new CNABEmptyFileError()
  }
  
  return lines
}

export function loadFixtureAsFile(filename: string): File {
  const fixturePath = join(__dirname, '..', '..', filename)
  const buffer = readFileSync(fixturePath)
  return new File([buffer], filename, { type: 'text/plain' })
}

export function loadBankFixture(bankPath: string): File {
  const fixturePath = join(__dirname, '..', '..', '..', 'banks', bankPath)
  const buffer = readFileSync(fixturePath)
  return new File([buffer], bankPath, { type: 'text/plain' })
}

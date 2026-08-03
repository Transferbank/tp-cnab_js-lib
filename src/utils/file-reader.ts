import { CNABEmptyFileError } from '@tp-types/errors'


export function splitAndValidateLines(content: string): string[] {
  const lines = content.split(/\r?\n/).filter((line) => line.length > 0)
  
  if (lines.length === 0) {
    throw new CNABEmptyFileError()
  }
  
  return lines
}

export async function readCnabFile(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer()
  const decoder = new TextDecoder('latin1')
  const content = decoder.decode(arrayBuffer)
  
  return splitAndValidateLines(content)
}

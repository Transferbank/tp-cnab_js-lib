import { CNABEmptyFileError } from '@tp-types/errors'

export async function readCnabFile(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer()
  const decoder = new TextDecoder('latin1')
  const content = decoder.decode(arrayBuffer)
  
  const lines = content.split(/\r?\n/).filter((line) => line.length > 0)
  
  if (lines.length === 0) {
    throw new CNABEmptyFileError()
  }
  
  return lines
}

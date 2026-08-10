import { CNABNoLinesProvidedError } from '@/types/errors/error-types'

function parseRawContent(rawContent: string): string[] {
  const lines = rawContent.split(/\r?\n/).filter((line) => line.length > 0)
  if (lines.length === 0) {
    throw new CNABNoLinesProvidedError()
  }
  return lines
}

async function decodeFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const decoder = new TextDecoder('iso-8859-1')
  return decoder.decode(arrayBuffer)
}

export async function readCnabLines(file: File): Promise<string[]> {
  const rawContent = await decodeFile(file)
  return parseRawContent(rawContent)
}

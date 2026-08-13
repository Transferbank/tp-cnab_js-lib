export async function readCnabLines(file: File): Promise<string[]> {
  const text = await file.text()
  return text.split(/\r?\n/).filter(line => line.length > 0)
}



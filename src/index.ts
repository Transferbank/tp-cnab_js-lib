import { CnabFile } from '@cnab/type/cnab-file'

export async function openCnabFile(file: File): Promise<CnabFile> {
  return CnabFile.openFromFile(file)
}

export function openCnabFileFromLines(lines: string[]): CnabFile {
  return CnabFile.openFromLines(lines)
}

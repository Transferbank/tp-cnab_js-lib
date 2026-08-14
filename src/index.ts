import { CnabFile } from './cnab/type/cnab-file'

export async function openCnabFile(file: File): Promise<CnabFile> {
  return CnabFile.open(file)
}

export function openCnabFileFromLines(lines: string[]): CnabFile {
  return CnabFile.openFromLines(lines)
}

import { CnabFile } from './cnab/types/cnab-file'
import { readCnabLines } from './utils/file-reader'

export async function openCnabFile(file: File): Promise<CnabFile>
export function openCnabFile(lines: string[]): CnabFile
export function openCnabFile(input: File | string[]): Promise<CnabFile> | CnabFile {
  if (input instanceof File) {
    return readCnabLines(input).then(lines => CnabFile.open(lines))
  }
  return CnabFile.open(input)
}

import { CnabFile } from '@cnab/type/cnab-file'

export async function openCnabFile(file: File): Promise<CnabFile> {
  return CnabFile.open(file)
}

export function openCnabFileFromLines(lines: string[]): CnabFile {
  return CnabFile.fromLines(lines)
}

export { Cnab } from '@cnab/type/cnab'
export { CnabBoleto } from '@cnab/type/cnab-boleto'
export { CnabLineData } from '@cnab/type/cnab-line-data'
export { CnabField } from '@cnab/type/cnab-field'
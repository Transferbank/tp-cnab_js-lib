import { CnabFileType } from '@cnab/type/cnab-file-type'
import { CnabBaseFile } from '@cnab/type/cnab-base-file'
import { CNAB_RETORNO_BANK_SCHEMAS } from '@cnab/bank/cnab-retorno-bank-schemas'

export class CnabRetornoFile extends CnabBaseFile {
  readonly fileType = CnabFileType.RETORNO
  protected readonly schemas = CNAB_RETORNO_BANK_SCHEMAS

  private constructor() {
    super()
  }

  static async open(file: File): Promise<CnabRetornoFile> {
    const lines = await CnabBaseFile.readFile(file)
    return CnabRetornoFile.fromLines(lines)
  }

  static fromLines(lines: string[]): CnabRetornoFile {
    return new CnabRetornoFile().load(lines)
  }
}

import { CnabFileType } from '@cnab/type/cnab-file-type'
import { CnabBaseFile } from '@cnab/type/cnab-base-file'
import { CNAB_REMESSA_BANK_SCHEMAS } from '@cnab/bank/cnab-remessa-bank-schemas'

export class CnabFile extends CnabBaseFile {
  protected readonly fileType = CnabFileType.REMESSA
  protected readonly schemas = CNAB_REMESSA_BANK_SCHEMAS

  private constructor() {
    super()
  }

  static async open(file: File): Promise<CnabFile> {
    const lines = await CnabBaseFile.readFile(file)
    return CnabFile.fromLines(lines)
  }

  static fromLines(lines: string[]): CnabFile {
    return new CnabFile().load(lines)
  }
}

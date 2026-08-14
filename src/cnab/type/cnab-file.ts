import { CnabFormat } from '@/cnab/type/cnab-format'
import { CnabBank } from '@/cnab/type/cnab-bank'
import { CnabSchema } from '@/cnab/type/cnab-schema'
import { CNAB_BANK_SCHEMAS } from '@/cnab/bank/cnab-bank-schemas'
import { 
  CnabMinimumLinesNotReachedException, 
  CnabFormatNotRecognizedException,
  CnabBankCodeNotFoundException,
  CnabBankSchemaNotFoundException
} from '@/cnab/exception/cnab-exception'

type NonEmptyArray<T> = [T, ...T[]]

export class CnabFile {
  public rawLines!: string[]
  public format!: CnabFormat
  public bank!: CnabBank
  public schema!: CnabSchema

  private constructor() {}

  static async openFromFile(file: File): Promise<CnabFile> {
    const lines = await CnabFile.read(file)
    return CnabFile.openFromLines(lines)
  }

  static openFromLines(lines: string[]): CnabFile {
    const cnabFile = new CnabFile()
    cnabFile.rawLines = lines

    if (cnabFile.rawLines.length < 3) {
      throw new CnabMinimumLinesNotReachedException()
    }

    cnabFile.format = cnabFile.detectFormat(cnabFile.rawLines[0])
    cnabFile.bank = cnabFile.detectBank(cnabFile.rawLines[0])
    cnabFile.schema = CnabFile.getSchema(cnabFile.bank, cnabFile.format)

    return cnabFile
  }

  

  private static async read(file: File): Promise<NonEmptyArray<string>> {
    const text = await file.text()
    const lines = text
      .split(/\r?\n/)
      .filter(line => line.length > 0)
    
    if (lines.length === 0) {
      throw new CnabMinimumLinesNotReachedException()
    }
    // garante array não vazio em nível de tipo
    return lines as NonEmptyArray<string>
  }

  private detectFormat(header: string): CnabFormat {
    const firstLineLength = header.length
    if (firstLineLength === CnabFormat.CNAB240) return CnabFormat.CNAB240
    if (firstLineLength === CnabFormat.CNAB400) return CnabFormat.CNAB400
    throw new CnabFormatNotRecognizedException(firstLineLength)
  }

  private detectBank(header: string): CnabBank {
    const code = this.format === CnabFormat.CNAB240 
      ? header.substring(0, 3)
      : header.substring(76, 79)
    
    const bank = CnabBank.fromCode(code)
    
    if (bank == null) {
      throw new CnabBankCodeNotFoundException(code, this.format)
    }
    
    return bank
  }

  private static getSchema(bank: CnabBank, format: CnabFormat): CnabSchema {
    const schema = CNAB_BANK_SCHEMAS[bank]?.[format]

    if (schema == null) {
      throw new CnabBankSchemaNotFoundException(bank, format)
    }

    return schema
  }
}

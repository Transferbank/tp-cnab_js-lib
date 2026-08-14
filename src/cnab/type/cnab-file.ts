import { CnabFormat } from '@/cnab/type/cnab-format'
import { CnabBank } from '@/cnab/type/cnab-bank'
import { CnabSchema } from '@/cnab/type/cnab-schema'
import { CNAB_BANK_SCHEMAS } from '@/cnab/bank/cnab-bank-schemas'
import { 
  CnabFileInsufficientLinesException, 
  CnabFileInvalidFormatException,
  CnabFileUnsupportedBankException 
} from '@/cnab/exception/cnab-exception'

export class CnabFile {
  private rawLines!: string[]
  private format!: CnabFormat
  private bank!: CnabBank
  private schema!: CnabSchema

  private constructor() {}

  static async open(file: File): Promise<CnabFile> {
    const lines = await CnabFile.read(file)
    return CnabFile.create(lines)
  }

  static openFromLines(lines: string[]): CnabFile {
    return CnabFile.create(lines)
  }

  private static create(lines: string[]): CnabFile {
    const cnabFile = new CnabFile()
    cnabFile.rawLines = lines

    if (cnabFile.rawLines.length < 3) {
      throw new CnabFileInsufficientLinesException(cnabFile.rawLines.length)
    }

    cnabFile.format = cnabFile.detectCnabFormat(cnabFile.rawLines[0])
    cnabFile.bank = cnabFile.detectBank(cnabFile.rawLines[0])
    cnabFile.schema = CnabFile.getSchema(cnabFile.bank, cnabFile.format)

    return cnabFile
  }

  static async read(file: File): Promise<string[]> {
    const text = await file.text()
    return text
      .split(/\r?\n/)
      .filter(line => line.length > 0)
  }

  private detectCnabFormat(header: string): CnabFormat {
    const firstLineLength = header.length
    if (firstLineLength === CnabFormat.CNAB240) return CnabFormat.CNAB240
    if (firstLineLength === CnabFormat.CNAB400) return CnabFormat.CNAB400
    throw new CnabFileInvalidFormatException(firstLineLength)
  }

  private detectBank(header: string): CnabBank {
    const code = this.format === CnabFormat.CNAB240 
      ? header.substring(0, 3)
      : header.substring(76, 79)
    
    const bank = CnabBank.fromCode(code)
    
    if (bank == null) {
      throw new CnabFileUnsupportedBankException(code)
    }
    
    return bank
  }

  private static getSchema(bank: CnabBank, format: CnabFormat): CnabSchema {
    const schema = CNAB_BANK_SCHEMAS[bank]?.[format]

    if (schema == null) {
      throw new Error(`Schema não encontrado para banco ${bank} e formato ${format}`)
    }

    return schema
  }

  getLines(): string[] {
    return this.rawLines
  }

  getFormat(): CnabFormat {
    return this.format
  }

  getBank(): CnabBank {
    return this.bank
  }

  getSchema(): CnabSchema {
    return this.schema
  }
}

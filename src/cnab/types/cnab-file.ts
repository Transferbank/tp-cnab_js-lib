import { CnabFormat } from './cnab-format'
import { CnabBank, CnabBankCode } from './cnab-bank-code'
import { CnabSchema } from './cnab-schema'
import { CNAB_BANK_SCHEMAS } from '../banks/cnab-bank-schemas'
import { 
  CnabFileInsufficientLinesException, 
  CnabFileInvalidFormatException,
  CnabFileUnsupportedBankException 
} from './cnab-exceptions'

export class CnabFile {
  private readonly rawLines: string[]
  private readonly format: CnabFormat
  private readonly bankCode: CnabBankCode
  private readonly schema: CnabSchema

  private constructor(lines: string[]) {
    this.rawLines = lines
    this.format = this.detectCnabFormat(this.rawLines[0])
    this.bankCode = this.detectBankCode(this.rawLines[0])
    this.schema = CnabFile.getSchema(this.bankCode, this.format)
  }

  static open(lines: string[]): CnabFile {
    if (lines.length < 3) {
      throw new CnabFileInsufficientLinesException(lines.length)
    }
    return new CnabFile(lines)
  }

  private detectCnabFormat(header: string): CnabFormat {
    const firstLineLength = header.length
    if (firstLineLength === CnabFormat.CNAB240) return CnabFormat.CNAB240
    if (firstLineLength === CnabFormat.CNAB400) return CnabFormat.CNAB400
    throw new CnabFileInvalidFormatException(firstLineLength)
  }

  private detectBankCode(header: string): CnabBankCode {
    const code = this.format === CnabFormat.CNAB240 
      ? header.substring(0, 3)
      : header.substring(76, 79)
    
    const bankCode = CnabBankCode.fromBankCode(code)
    
    if (bankCode == null) {
      throw new CnabFileUnsupportedBankException(code)
    }
    
    return bankCode
  }

  private static getSchema(bankCode: CnabBankCode, format: CnabFormat): CnabSchema {
    const bank = CnabBankCode.getBankFromCode(bankCode)
    const schema = CNAB_BANK_SCHEMAS[bank]?.[format]

    if (schema == null) {
      throw new Error(`Schema não encontrado para banco ${bankCode} e formato ${format}`)
    }

    return schema
  }

  getLines(): string[] {
    return this.rawLines
  }

  getFormat(): CnabFormat {
    return this.format
  }

  getBankCode(): CnabBankCode {
    return this.bankCode
  }

  getBank(): CnabBank {
    return CnabBankCode.getBankFromCode(this.bankCode)
  }

  getSchema(): CnabSchema {
    return this.schema
  }
}

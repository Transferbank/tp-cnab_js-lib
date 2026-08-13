import { CnabFormat } from './cnab-format'
import { CnabBank, CnabBankCode } from './cnab-bank-code'
import { CnabSchema } from './cnab-schema'
import { CNAB_BANK_SCHEMAS } from '../banks/cnab-bank-schemas'
import { 
  CnabFileInsufficientLinesException, 
  CnabFileInvalidFormatException,
  CnabFileUnsupportedBankException 
} from './cnab-exceptions'
import { CnabField } from './cnab-field'
import { CnabValidationResult } from './cnab-validation-result'

export class CnabFile {
  private rawLines!: string[]
  private format!: CnabFormat
  private bankCode!: CnabBankCode
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
    cnabFile.bankCode = cnabFile.detectBankCode(cnabFile.rawLines[0])
    cnabFile.schema = CnabFile.getSchema(cnabFile.bankCode, cnabFile.format)

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

  validate(withFeedback: boolean = false, _extraFields?: (typeof CnabField)[]): boolean | CnabValidationResult {
    const result = this.schema.validate(
      this.rawLines,
      !withFeedback,
      _extraFields
    )

    if (withFeedback) {
      return result
    }

    return result.isValid
  }
}

import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabField } from '@cnab/type/cnab-field'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabSchema } from '@cnab/type/cnab-schema'
import { CNAB_BANK_SCHEMAS } from '@cnab/bank/cnab-bank-schemas'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { 
  CnabMinimumLinesNotReachedException,
  CnabFormatNotRecognizedException,
  CnabBankCodeNotFoundException,
  CnabBankSchemaNotFoundException
} from '@cnab/exception/cnab-exception'

export class CnabFile {
  public rawLines!: string[]
  public format!: CnabFormat
  public bank!: CnabBank
  public schema!: CnabSchema

  private constructor() {}

  static async open(file: File): Promise<CnabFile> {
    const lines = await CnabFile.read(file)
    return CnabFile.fromLines(lines)
  }

  static fromLines(lines: string[]): CnabFile {
    if (lines.length < 3) throw new CnabMinimumLinesNotReachedException()
    const cnabFile = new CnabFile()
    cnabFile.rawLines = lines
    cnabFile.format = cnabFile.detectFormat(cnabFile.rawLines[0])
    cnabFile.bank = cnabFile.detectBank(cnabFile.rawLines[0], cnabFile.format)
    cnabFile.schema = CnabFile.getSchema(cnabFile.bank, cnabFile.format)
    return cnabFile
  }

  private static async read(file: File): Promise<string[]> {
    const arrayBuffer = await file.arrayBuffer()
    const decoder = new TextDecoder('iso-8859-1') // nome oficial de latin1
    const text = decoder.decode(arrayBuffer)
    return text.split(/\r?\n/).filter(line => line.length > 0)
  }

  private detectFormat(header: string): CnabFormat {
    if (header.length === 240) return CnabFormat.CNAB240
    if (header.length === 400) return CnabFormat.CNAB400
    throw new CnabFormatNotRecognizedException(header.length)
  }

  private detectBank(header: string, cnabFormat: CnabFormat): CnabBank {
    const code = cnabFormat === CnabFormat.CNAB240 
      ? header.substring(0, 3)
      : header.substring(76, 79)
    const bank = CnabBank.fromCode(code)
    if (bank == null) throw new CnabBankCodeNotFoundException(code, cnabFormat)
    return bank
  }

  private static getSchema(bank: CnabBank, format: CnabFormat): CnabSchema {
    const schema = CNAB_BANK_SCHEMAS[bank]?.[format]
    if (schema == null) throw new CnabBankSchemaNotFoundException(bank, format)
    return schema
  }

  validate(withFeedback: boolean = false, fields?: (typeof CnabField)[]): CnabValidationResult {
    return this.schema.validate(
      this.rawLines,
      !withFeedback,
      fields ?? []
    )
  }

  read(_fields: (typeof CnabField)[]): CnabField[] {
    throw new Error('Not implemented')
  }
}
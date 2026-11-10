import { Cnab } from '@cnab/type/cnab'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabFileType } from '@cnab/type/cnab-file-type'
import { CnabSchema } from '@cnab/type/cnab-schema'
import { CNAB_REMESSA_BANK_SCHEMAS } from '@cnab/bank/cnab-remessa-bank-schemas'
import { CNAB_RETORNO_BANK_SCHEMAS } from '@cnab/bank/cnab-retorno-bank-schemas'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import {
  CnabMinimumLinesNotReachedException,
  CnabFormatNotRecognizedException,
  CnabFileTypeNotRecognizedException,
  CnabBankCodeNotFoundException,
  CnabBankSchemaNotFoundException,
  CnabInvalidFileException
} from '@cnab/exception/cnab-exception'

const CNAB_BANK_SCHEMAS_BY_FILE_TYPE: Record<CnabFileType, Record<CnabBank, Record<CnabFormat, CnabSchema>>> = {
  [CnabFileType.REMESSA]: CNAB_REMESSA_BANK_SCHEMAS,
  [CnabFileType.RETORNO]: CNAB_RETORNO_BANK_SCHEMAS
}

export class CnabFile {
  public rawLines!: string[]
  public format!: CnabFormat
  public fileType!: CnabFileType
  public bank!: CnabBank
  public schema!: CnabSchema
  public boletoCount!: number

  private constructor() {}

  static async open(file: File): Promise<CnabFile> {
    const lines = await CnabFile.readFile(file)
    return CnabFile.fromLines(lines)
  }

  static fromLines(lines: string[]): CnabFile {
    if (lines.length < 3) throw new CnabMinimumLinesNotReachedException()
    const cnabFile = new CnabFile()
    cnabFile.rawLines = lines
    cnabFile.format = CnabFile.detectFormat(cnabFile.rawLines[0])
    cnabFile.fileType = CnabFile.detectFileType(cnabFile.rawLines[0], cnabFile.format)
    cnabFile.bank = CnabFile.detectBank(cnabFile.rawLines[0], cnabFile.format)
    cnabFile.schema = CnabFile.getSchema(cnabFile.fileType, cnabFile.bank, cnabFile.format)
    cnabFile.boletoCount = cnabFile.schema.countBoletos(cnabFile.rawLines)
    return cnabFile
  }

  private static async readFile(file: File): Promise<string[]> {
    const arrayBuffer = await file.arrayBuffer()
    const decoder = new TextDecoder('iso-8859-1') // nome oficial de latin1
    const text = decoder.decode(arrayBuffer)
    return text.split(/\r?\n/).filter(line => line.length > 0)
  }

  private static detectFormat(header: string): CnabFormat {
    if (header.length == 240) return CnabFormat.CNAB240
    if (header.length == 400) return CnabFormat.CNAB400
    throw new CnabFormatNotRecognizedException(header.length)
  }

  private static detectFileType(header: string, cnabFormat: CnabFormat): CnabFileType {
    const code = cnabFormat == CnabFormat.CNAB240 ? header.substring(142, 143) : header.substring(1, 2)
    if (code == '1') return CnabFileType.REMESSA
    if (code == '2') return CnabFileType.RETORNO
    throw new CnabFileTypeNotRecognizedException(code, cnabFormat)
  }

  private static detectBank(header: string, cnabFormat: CnabFormat): CnabBank {
    const code = cnabFormat == CnabFormat.CNAB240
      ? header.substring(0, 3)
      : header.substring(76, 79)
    const bank = CnabBank.fromCode(code)
    if (bank == null) throw new CnabBankCodeNotFoundException(code, cnabFormat)
    return bank
  }

  private static getSchema(fileType: CnabFileType, bank: CnabBank, format: CnabFormat): CnabSchema {
    const schema = CNAB_BANK_SCHEMAS_BY_FILE_TYPE[fileType][bank]?.[format]
    if (schema == null) throw new CnabBankSchemaNotFoundException(bank, format, fileType)
    return schema
  }

  validate(withFeedback: boolean = false, extraFields?: CnabFieldClass[]): CnabValidationResult {
    return this.schema.validate(
      this.rawLines,
      !withFeedback,
      extraFields ?? []
    )
  }

  read(extraFields?: CnabFieldClass[]): Cnab {
    extraFields = extraFields ?? []

    const result = this.validate(false, extraFields)
    if (!result.isValid) {
      throw new CnabInvalidFileException(result.errors)
    }

    return this.schema.extractCnab(this.rawLines, extraFields)
  }
}

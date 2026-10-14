import { Cnab } from '@cnab/type/cnab'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabFileType } from '@cnab/type/cnab-file-type'
import { CnabSchema } from '@cnab/type/cnab-schema'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import {
  CnabMinimumLinesNotReachedException,
  CnabFormatNotRecognizedException,
  CnabFileTypeNotRecognizedException,
  CnabFileTypeNotSupportedException,
  CnabBankCodeNotFoundException,
  CnabBankSchemaNotFoundException,
  CnabInvalidFileException
} from '@cnab/exception/cnab-exception'

export abstract class CnabBaseFile {
  public rawLines!: string[]
  public format!: CnabFormat
  public bank!: CnabBank
  public schema!: CnabSchema
  public boletoCount!: number
  public abstract readonly fileType: CnabFileType

  protected abstract readonly schemas: Record<CnabBank, Record<CnabFormat, CnabSchema>>

  protected load(lines: string[]): this {
    if (lines.length < 3) throw new CnabMinimumLinesNotReachedException()
    this.rawLines = lines
    this.format = CnabBaseFile.detectFormat(this.rawLines[0])
    const fileType = CnabBaseFile.detectFileType(this.rawLines[0], this.format)
    if (fileType != this.fileType) throw new CnabFileTypeNotSupportedException(fileType, this.fileType)
    this.bank = CnabBaseFile.detectBank(this.rawLines[0], this.format)
    this.schema = this.getSchema(this.bank, this.format)
    this.boletoCount = this.schema.countBoletos(this.rawLines)
    return this
  }

  protected static async readFile(file: File): Promise<string[]> {
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
    const code = cnabFormat === CnabFormat.CNAB240
      ? header.substring(0, 3)
      : header.substring(76, 79)
    const bank = CnabBank.fromCode(code)
    if (bank == null) throw new CnabBankCodeNotFoundException(code, cnabFormat)
    return bank
  }

  private getSchema(bank: CnabBank, format: CnabFormat): CnabSchema {
    const schema = this.schemas[bank]?.[format]
    if (schema == null) throw new CnabBankSchemaNotFoundException(bank, format)
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

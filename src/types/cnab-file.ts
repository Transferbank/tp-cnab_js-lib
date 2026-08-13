import { CnabFormat } from './cnab-format'
import { CnabFileInsufficientLinesException, CnabFileInvalidFormatException } from './exceptions/cnab-file-exceptions'

export class CnabFile {
  private readonly rawLines: string[]
  private readonly format: CnabFormat

  private constructor(lines: string[]) {
    this.rawLines = lines
    this.format = this.detectCnabFormat()
  }

  static open(lines: string[]): CnabFile {
    if (lines.length < 3) {
      throw new CnabFileInsufficientLinesException(lines.length)
    }
    return new CnabFile(lines)
  }

  private detectCnabFormat(): CnabFormat {
    const firstLineLength = this.rawLines[0].length

    if (firstLineLength === 240) {
      return CnabFormat.CNAB240
    }
    
    if (firstLineLength === 400) {
      return CnabFormat.CNAB400
    }

    throw new CnabFileInvalidFormatException(firstLineLength)
  }

  getLines(): string[] {
    return this.rawLines
  }

  getFormat(): CnabFormat {
    return this.format
  }
}

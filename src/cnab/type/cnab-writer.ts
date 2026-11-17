import { Cnab, CnabBoleto } from '@cnab/type/cnab'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabFileType } from '@cnab/type/cnab-file-type'
import { CnabLineSchema } from '@cnab/type/cnab-line-schema'
import { CNAB_RETORNO_BANK_SCHEMAS } from '@cnab/bank/cnab-retorno-bank-schemas'
import { CnabMinimumLinesNotReachedException, CnabWriteNotSupportedException } from '@cnab/exception/cnab-exception'
import { Cnab400LineSizeValidator } from '@cnab/validators/cnab-line-size-validator'
import { writeAtRange } from '@cnab/utils/line-writer'

const CNAB400_SEQUENCIAL_RANGE: [number, number] = [395, 400]

export class CnabWriter {
  static write(cnab: Cnab, bank: CnabBank, format: CnabFormat, fileType: CnabFileType): string[] {
    if (format != CnabFormat.CNAB400 || fileType != CnabFileType.RETORNO) {
      throw new CnabWriteNotSupportedException(format, fileType)
    }
    if (cnab.boletos.length == 0) {
      throw new CnabMinimumLinesNotReachedException()
    }

    const schema = CNAB_RETORNO_BANK_SCHEMAS[bank][format]
    const lines: string[] = []

    lines.push(CnabWriter.writeLine(schema.header, lines.length))
    cnab.boletos.forEach((_boleto: CnabBoleto): void => {
      lines.push(CnabWriter.writeLine(schema.boleto, lines.length))
    })
    lines.push(CnabWriter.writeLine(schema.trailer, lines.length))

    return lines
  }

  private static writeLine(lineSchema: CnabLineSchema, lineNumber: number): string {
    const line = Array.from({ length: Cnab400LineSizeValidator.expectedSize }, (): string => ' ')

    for (const { range, value } of lineSchema.fixedContent) {
      writeAtRange(line, range, value)
    }

    const sequencial = String(lineNumber + 1).padStart(6, '0')
    writeAtRange(line, CNAB400_SEQUENCIAL_RANGE, sequencial)

    return line.join('')
  }
}

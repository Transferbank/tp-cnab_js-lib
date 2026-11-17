import { Cnab, CnabBoleto } from '@cnab/type/cnab'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabFileType } from '@cnab/type/cnab-file-type'
import { CnabField } from '@cnab/type/cnab-field'
import { CnabLineSchema } from '@cnab/type/cnab-line-schema'
import { CnabGenericFieldError, CnabValidationError } from '@cnab/type/cnab-validation-error'
import { CNAB_RETORNO_BANK_SCHEMAS } from '@cnab/bank/cnab-retorno-bank-schemas'
import {
  CnabInvalidFileException,
  CnabMinimumLinesNotReachedException,
  CnabWriteNotSupportedException
} from '@cnab/exception/cnab-exception'
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
    const errors: CnabValidationError[] = []

    lines.push(CnabWriter.writeLine(schema.header, cnab.header.fields, lines.length, errors))
    cnab.boletos.forEach((boleto: CnabBoleto): void => {
      lines.push(CnabWriter.writeLine(schema.boleto, boleto.fields, lines.length, errors))
    })
    lines.push(CnabWriter.writeLine(schema.trailer, cnab.trailer.fields, lines.length, errors))

    if (errors.length > 0) {
      throw new CnabInvalidFileException(errors)
    }

    return lines
  }

  private static writeLine(
    lineSchema: CnabLineSchema,
    values: Record<string, unknown>,
    lineNumber: number,
    errors: CnabValidationError[]
  ): string {
    const line = Array.from({ length: Cnab400LineSizeValidator.expectedSize }, (): string => ' ')

    for (const { range, value } of lineSchema.fixedContent) {
      writeAtRange(line, range, value)
    }

    for (const fieldClass of lineSchema.fields) {
      const field = new fieldClass(line.join(''), lineNumber)
      if (!field.shouldValidate()) {
        continue
      }
      CnabWriter.writeField(field, line, values, lineNumber, errors)
    }

    const sequencial = String(lineNumber + 1).padStart(6, '0')
    writeAtRange(line, CNAB400_SEQUENCIAL_RANGE, sequencial)

    return line.join('')
  }

  private static writeField(
    field: CnabField<unknown>,
    line: string[],
    values: Record<string, unknown>,
    lineNumber: number,
    errors: CnabValidationError[]
  ): void {
    try {
      field.write(line, values)
    } catch (error) {
      if (!(error instanceof TypeError || error instanceof RangeError)) {
        throw error
      }
      errors.push(new CnabGenericFieldError({
        message: `Campo ${field.fieldKey} não pode ser escrito: ${error.message}`,
        lineNumber,
        fieldKey: field.fieldKey,
        range: field.range
      }))
    }
  }
}

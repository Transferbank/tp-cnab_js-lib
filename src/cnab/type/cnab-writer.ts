import { Cnab, CnabBoleto } from '@cnab/type/cnab'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabFileType } from '@cnab/type/cnab-file-type'
import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabLineSchema } from '@cnab/type/cnab-line-schema'
import { CnabSchema } from '@cnab/type/cnab-schema'
import { CnabGenericFieldError, CnabValidationError } from '@cnab/type/cnab-validation-error'
import { CNAB_RETORNO_BANK_SCHEMAS } from '@cnab/bank/cnab-retorno-bank-schemas'
import {
  CnabInvalidFileException,
  CnabMinimumLinesNotReachedException,
  CnabWriteNotSupportedException
} from '@cnab/exception/cnab-exception'
import { Cnab400LineSizeValidator } from '@cnab/validators/cnab-line-size-validator'
import { writeAtRange } from '@cnab/utils/line-writer'
import { formatDateBR } from '@cnab/utils/date-parser'

const CNAB400_SEQUENCIAL_RANGE: [number, number] = [395, 400]

const LINE_NAMES: Record<CnabFieldType, string> = {
  [CnabFieldType.HEADER]: 'header',
  [CnabFieldType.BOLETO]: 'boleto',
  [CnabFieldType.TRAILER]: 'trailer'
}

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
    const boletoLineNumbers: number[] = []

    lines.push(CnabWriter.writeLine(schema.header, cnab.header.fields, lines.length, errors))
    cnab.boletos.forEach((boleto: CnabBoleto): void => {
      boletoLineNumbers.push(lines.length)
      lines.push(CnabWriter.writeLine(schema.boleto, boleto.fields, lines.length, errors))
    })
    lines.push(CnabWriter.writeLine(schema.trailer, cnab.trailer.fields, lines.length, errors))

    if (errors.length > 0) {
      throw new CnabInvalidFileException(errors)
    }

    const result = schema.validate(lines, false)
    if (!result.isValid) {
      throw new CnabInvalidFileException(result.errors)
    }

    const mismatches = CnabWriter.compareWithWritten(cnab, schema, lines, boletoLineNumbers)
    if (mismatches.length > 0) {
      throw new CnabInvalidFileException(mismatches)
    }

    return lines
  }

  private static compareWithWritten(
    cnab: Cnab,
    schema: CnabSchema,
    lines: string[],
    boletoLineNumbers: number[]
  ): CnabValidationError[] {
    const written = schema.extractCnab(lines)
    const trailerLineNumber = lines.length - 1
    const errors: CnabValidationError[] = []

    const headerErrors = CnabWriter.compareLine(
      schema.header,
      cnab.header.fields,
      written.header.fields,
      lines,
      0
    )
    errors.push(...headerErrors)

    cnab.boletos.forEach((boleto: CnabBoleto, index: number): void => {
      const writtenFields = written.boletos[index]?.fields ?? {}
      const boletoErrors = CnabWriter.compareLine(
        schema.boleto,
        boleto.fields,
        writtenFields,
        lines,
        boletoLineNumbers[index]
      )
      errors.push(...boletoErrors)
    })

    const trailerErrors = CnabWriter.compareLine(
      schema.trailer,
      cnab.trailer.fields,
      written.trailer.fields,
      lines,
      trailerLineNumber
    )
    errors.push(...trailerErrors)

    return errors
  }

  private static compareLine(
    lineSchema: CnabLineSchema,
    informedFields: Record<string, unknown>,
    writtenFields: Record<string, unknown>,
    lines: string[],
    lineNumber: number
  ): CnabValidationError[] {
    const errors: CnabValidationError[] = []

    for (const fieldClass of lineSchema.fields) {
      const field = new fieldClass(lines[lineNumber], lineNumber)
      const informed = informedFields[field.fieldKey] ?? null
      const read = writtenFields[field.fieldKey] ?? null
      if (CnabWriter.isSameValue(field, informed, read)) {
        continue
      }
      errors.push(new CnabGenericFieldError({
        message: CnabWriter.describeMismatch(field, informed, read),
        lineNumber,
        fieldKey: field.fieldKey,
        range: field.range
      }))
    }

    return errors
  }

  private static isSameValue(field: CnabField<unknown>, informed: unknown, read: unknown): boolean {
    try {
      return field.formatValue(informed) == field.formatValue(read)
    } catch (error) {
      if (!(error instanceof TypeError || error instanceof RangeError)) {
        throw error
      }
      return false
    }
  }

  private static describeMismatch(field: CnabField<unknown>, informed: unknown, read: unknown): string {
    const informedDescription = `Campo ${field.fieldKey} foi informado como ${CnabWriter.describeValue(informed)}`
    if (field.belongsToLine() && !field.shouldValidate()) {
      return `${informedDescription}, mas o layout do banco não lê esse campo com o conteúdo desta linha, como o código de ocorrência`
    }
    return `${informedDescription}, mas é lido do arquivo escrito como ${CnabWriter.describeValue(read)}`
  }

  private static describeValue(value: unknown): string {
    if (value == null) {
      return 'vazio'
    }
    if (value instanceof Date) {
      return formatDateBR(value)
    }
    if (typeof value == 'string') {
      return `"${value}"`
    }
    return String(value)
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

    const unknownKeyErrors = CnabWriter.findUnknownKeys(lineSchema, values, lineNumber)
    errors.push(...unknownKeyErrors)

    for (const fieldClass of lineSchema.fields) {
      const field = new fieldClass(line.join(''), lineNumber)
      if (!field.belongsToLine()) {
        continue
      }
      CnabWriter.writeField(field, line, values, lineNumber, errors)
    }

    const sequencial = String(lineNumber + 1).padStart(6, '0')
    writeAtRange(line, CNAB400_SEQUENCIAL_RANGE, sequencial)

    return line.join('')
  }

  private static findUnknownKeys(
    lineSchema: CnabLineSchema,
    values: Record<string, unknown>,
    lineNumber: number
  ): CnabValidationError[] {
    const knownKeys = new Set<string>()
    for (const fieldClass of lineSchema.fields) {
      knownKeys.add(new fieldClass('', lineNumber).fieldKey)
    }

    const errors: CnabValidationError[] = []
    for (const fieldKey of Object.keys(values)) {
      if (knownKeys.has(fieldKey)) {
        continue
      }
      errors.push(new CnabGenericFieldError({
        message: `Campo ${fieldKey} não existe no layout do ${LINE_NAMES[lineSchema.fieldType]}`,
        lineNumber,
        fieldKey,
        range: [1, Cnab400LineSizeValidator.expectedSize]
      }))
    }

    return errors
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

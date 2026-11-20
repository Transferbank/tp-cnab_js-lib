import { Cnab, CnabBoleto } from '@cnab/type/cnab'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabFileType } from '@cnab/type/cnab-file-type'
import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabLineSchema } from '@cnab/type/cnab-line-schema'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
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

    lines.push(CnabWriter.writeLine(schema.header, cnab.header.fields, lines.length))
    for (const boleto of cnab.boletos) {
      lines.push(CnabWriter.writeLine(schema.boleto, boleto.fields, lines.length))
    }
    lines.push(CnabWriter.writeLine(schema.trailer, cnab.trailer.fields, lines.length))

    const result = schema.validate(lines, true)
    if (!result.isValid) {
      throw new CnabInvalidFileException(result.errors.slice(0, 1))
    }

    const written = schema.extractCnab(lines)
    CnabWriter.compareLine(schema.header, cnab.header.fields, written.header.fields, lines, 0)
    cnab.boletos.forEach((boleto: CnabBoleto, index: number): void => {
      const writtenFields = written.boletos[index]?.fields ?? {}
      CnabWriter.compareLine(schema.boleto, boleto.fields, writtenFields, lines, index + 1)
    })
    CnabWriter.compareLine(schema.trailer, cnab.trailer.fields, written.trailer.fields, lines, lines.length - 1)

    return lines
  }

  private static compareLine(
    lineSchema: CnabLineSchema,
    informedFields: Record<string, unknown>,
    writtenFields: Record<string, unknown>,
    lines: string[],
    lineNumber: number
  ): void {
    for (const fieldClass of lineSchema.fields) {
      const field = new fieldClass(lines[lineNumber], lineNumber)
      const informed = informedFields[field.fieldKey] ?? null
      const read = writtenFields[field.fieldKey] ?? null
      if (CnabWriter.isSameValue(field, informed, read)) {
        continue
      }
      throw new CnabInvalidFileException([new CnabGenericFieldError({
        message: CnabWriter.describeMismatch(field, informed, read),
        lineNumber,
        fieldKey: field.fieldKey,
        range: field.range
      })])
    }
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

  private static writeLine(lineSchema: CnabLineSchema, values: Record<string, unknown>, lineNumber: number): string {
    const line = Array.from({ length: Cnab400LineSizeValidator.expectedSize }, (): string => ' ')

    for (const { range, value } of lineSchema.fixedContent) {
      writeAtRange(line, range, value)
    }

    const fields: Array<CnabField<unknown>> = []
    for (const fieldClass of lineSchema.fields) {
      fields.push(new fieldClass(line.join(''), lineNumber))
    }

    CnabWriter.checkKnownKeys(lineSchema, fields, values, lineNumber)

    for (const field of fields) {
      if (!field.belongsToLine()) {
        continue
      }
      CnabWriter.writeField(field, line, values, lineNumber)
    }

    const sequencial = String(lineNumber + 1).padStart(6, '0')
    writeAtRange(line, CNAB400_SEQUENCIAL_RANGE, sequencial)

    return line.join('')
  }

  private static checkKnownKeys(
    lineSchema: CnabLineSchema,
    fields: Array<CnabField<unknown>>,
    values: Record<string, unknown>,
    lineNumber: number
  ): void {
    const knownKeys = new Set<string>()
    for (const field of fields) {
      knownKeys.add(field.fieldKey)
    }

    for (const fieldKey of Object.keys(values)) {
      if (knownKeys.has(fieldKey)) {
        continue
      }
      throw new CnabInvalidFileException([new CnabGenericFieldError({
        message: `Campo ${fieldKey} não existe no layout do ${LINE_NAMES[lineSchema.fieldType]}`,
        lineNumber,
        fieldKey,
        range: [1, Cnab400LineSizeValidator.expectedSize]
      })])
    }
  }

  private static writeField(field: CnabField<unknown>, line: string[], values: Record<string, unknown>, lineNumber: number): void {
    const value = values[field.fieldKey] ?? null

    try {
      field.write(line, value)
    } catch (error) {
      if (!(error instanceof TypeError || error instanceof RangeError)) {
        throw error
      }
      throw new CnabInvalidFileException([new CnabGenericFieldError({
        message: `Campo ${field.fieldKey} não pode ser escrito: ${error.message}`,
        lineNumber,
        fieldKey: field.fieldKey,
        range: field.range
      })])
    }
  }
}

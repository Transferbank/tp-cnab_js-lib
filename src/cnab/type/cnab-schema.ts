import { Cnab, CnabBoleto, CnabHeader, CnabTrailer } from '@cnab/type/cnab'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabFixedContent, CnabLineSchema } from '@cnab/type/cnab-line-schema'
import { CnabBoletoGroupRule } from '@cnab/type/cnab-boleto-group-rule'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabField, CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabLineValidatorClass } from '@cnab/type/cnab-line-validator'

type CnabLineSchemaConfig = {
  fieldType: CnabFieldType
  fields: CnabFieldClass[]
  validators?: CnabLineValidatorClass[]
  fixedContent?: CnabFixedContent[]
}

export class CnabSchema {
  readonly bank: CnabBank
  readonly fmt: CnabFormat
  readonly boletoGroupRule: CnabBoletoGroupRule
  readonly header: CnabLineSchema
  readonly trailer: CnabLineSchema
  readonly boleto: CnabLineSchema

  constructor(config: {
    bank: CnabBank
    fmt: CnabFormat
    boletoGroupRule: CnabBoletoGroupRule
    header: CnabLineSchemaConfig
    trailer: CnabLineSchemaConfig
    boleto: CnabLineSchemaConfig
  }) {
    this.bank = config.bank
    this.fmt = config.fmt
    this.boletoGroupRule = config.boletoGroupRule

    const sharedConfig = {
      bank: this.bank,
      fmt: this.fmt,
      boletoGroupRule: this.boletoGroupRule,
    }

    this.header = CnabLineSchema.create({ ...sharedConfig, ...config.header })
    this.trailer = CnabLineSchema.create({ ...sharedConfig, ...config.trailer })
    this.boleto = CnabLineSchema.create({ ...sharedConfig, ...config.boleto })
  }

  get lineSchemas(): CnabLineSchema[] {
    return [this.header, this.trailer, this.boleto]
  }

  validate(
    rawLines: string[],
    eagerEnabled: boolean,
    extraFields?: CnabFieldClass[]
  ): CnabValidationResult {
    const result: CnabValidationResult = { isValid: true, errors: [] }

    const items: Array<[CnabLineSchema, string[], number]> = [
      [this.header, [rawLines[0]], 0],
      [this.trailer, [rawLines[rawLines.length - 1]], rawLines.length - 1],
      [this.boleto, rawLines.slice(1, -1), 1],
    ]

    const scopedExtraFields = this.scopedExtraFields(extraFields)

    for (const [group, lines, firstLine] of items) {
      const groupExtraFields = this.lineExtraFields(group, scopedExtraFields)

      const groupResult = group.validate(lines, eagerEnabled, firstLine, groupExtraFields)

      result.isValid = result.isValid && groupResult.isValid
      result.errors.push(...groupResult.errors)

      if (!result.isValid && eagerEnabled) {
        return result
      }
    }

    return result
  }

  private scopedExtraFields(extraFields?: CnabFieldClass[]): CnabFieldClass[] {
    return (extraFields ?? []).filter((field: CnabFieldClass) =>
      (field.bank == null || field.bank == this.bank) && (field.format == null || field.format == this.fmt)
    )
  }

  countBoletos(rawLines: string[]): number {
    let count = 0
    for (let i = 1; i < rawLines.length - 1; i++) {
      if (this.boleto.isBoletoGroupStart(rawLines[i])) {
        count++
      }
    }
    return count
  }

  extractCnab(rawLines: string[], extraFields?: CnabFieldClass[]): Cnab {
    const scopedExtraFields = this.scopedExtraFields(extraFields)
    const lastLine = rawLines.length - 1

    const headerFields: Record<string, unknown> = {}
    this.readLineFields(this.lineFields(this.header, scopedExtraFields), rawLines[0], 0, headerFields)
    const trailerFields: Record<string, unknown> = {}
    this.readLineFields(this.lineFields(this.trailer, scopedExtraFields), rawLines[lastLine], lastLine, trailerFields)

    const cnab = new Cnab({
      header: new CnabHeader({ fields: headerFields }),
      trailer: new CnabTrailer({ fields: trailerFields })
    })

    const boletoFields = this.lineFields(this.boleto, scopedExtraFields)
    let currentBoleto = new CnabBoleto()
    rawLines.forEach((rawLine: string, lineNumber: number) => {
      if (this.boleto.isBoletoGroupStart(rawLine) && Object.keys(currentBoleto.fields).length > 0) {
        cnab.boletos.push(currentBoleto)
        currentBoleto = new CnabBoleto()
      }

      this.readLineFields(boletoFields, rawLine, lineNumber, currentBoleto.fields)
    })

    if (Object.keys(currentBoleto.fields).length > 0) {
      cnab.boletos.push(currentBoleto)
    }

    return cnab
  }

  private readLineFields(
    fields: CnabFieldClass[],
    rawLine: string,
    lineNumber: number,
    values: Record<string, unknown>
  ): void {
    for (const fieldType of fields) {
      const field = new fieldType(rawLine, lineNumber)
      if (!field.shouldValidate()) {
        continue
      }
      if (field.value != null) {
        values[field.fieldKey] = this.handleDuplicatedFields(field, values[field.fieldKey])
      }
    }
  }

  private lineFields(lineSchema: CnabLineSchema, scopedExtraFields: CnabFieldClass[]): CnabFieldClass[] {
    return [...lineSchema.fields, ...this.lineExtraFields(lineSchema, scopedExtraFields)]
  }

  private lineExtraFields(lineSchema: CnabLineSchema, scopedExtraFields: CnabFieldClass[]): CnabFieldClass[] {
    return scopedExtraFields.filter((field: CnabFieldClass) => field.fieldType === lineSchema.fieldType)
  }

  private handleDuplicatedFields(field: CnabField<unknown>, previousValue: unknown): unknown {
    return previousValue == null ? field.value : field.handleDuplicatedValue(previousValue)
  }
}

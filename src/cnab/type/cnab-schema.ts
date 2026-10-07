import { Cnab, CnabBoleto } from '@cnab/type/cnab'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabLineSchema } from '@cnab/type/cnab-line-schema'
import { CnabBoletoGroupRule } from '@cnab/type/cnab-boleto-group-rule'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabLineValidatorClass } from '@cnab/type/cnab-line-validator'

type CnabLineSchemaConfig = {
  fieldType: CnabFieldType
  fields: CnabFieldClass[]
  validators?: CnabLineValidatorClass[]
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

    for (const [group, lines, firstLine] of items) {
      const groupExtraFields = this.scopedExtraFields(extraFields).filter(
        (field: CnabFieldClass) => field.fieldType === group.fieldType
      )

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
    const cnab = new Cnab()

    const fields = [
      ...this.boleto.fields,
      ...this.scopedExtraFields(extraFields),
    ]

    let currentBoleto = new CnabBoleto()
    rawLines.forEach((rawLine: string, lineNumber: number) => {
      if (this.boleto.isBoletoGroupStart(rawLine) && Object.keys(currentBoleto.fields).length > 0) {
        cnab.boletos.push(currentBoleto)
        currentBoleto = new CnabBoleto()
      }

      for (const fieldType of fields) {
        const field = new fieldType(rawLine, lineNumber)
        if (!field.shouldValidate()) {
          continue
        }
        if (field.value != null) {
          currentBoleto.fields[field.fieldKey] = this.mergeFieldValues(currentBoleto.fields[field.fieldKey], field.value)
        }
      }
    })

    if (Object.keys(currentBoleto.fields).length > 0) {
      cnab.boletos.push(currentBoleto)
    }

    return cnab
  }

  private mergeFieldValues(currentValue: unknown, newValue: unknown): unknown {
    if (Array.isArray(currentValue) && Array.isArray(newValue)) {
      return [...new Set([...currentValue, ...newValue])]
    }
    return newValue
  }
}

import { ValorBoletoField } from '@cnab/field/cnab400/retorno/valor-boleto-field'
import { CnabField, CnabFieldClass } from '@cnab/type/cnab-field'
import { writeAtRange } from '@cnab/utils/line-writer'
import { sumRawAmounts } from '@cnab/utils/value-parser'

export class ValorPagoBoletoField extends ValorBoletoField {
  readonly fieldKey = 'valor_pago'
  readonly range: [number, number] = [254, 266]
  protected readonly addedFields: Array<CnabFieldClass<number>> = []
  protected readonly addedRanges: Array<[number, number]> = []

  protected extractRawValue(): string {
    const rawAmounts = [super.extractRawValue()]
    for (const field of this.createAddedFields()) {
      const [start, end] = field.range
      rawAmounts.push(this.extractRangeFromLine(start - 1, end))
    }
    for (const [start, end] of this.addedRanges) {
      rawAmounts.push(this.extractRangeFromLine(start - 1, end))
    }
    return sumRawAmounts(rawAmounts)
  }

  write(line: string[], fields: Record<string, unknown>): void {
    const total = fields[this.fieldKey] ?? null
    const addedFields = this.createAddedFields()
    if (total == null || addedFields.length == 0) {
      super.write(line, fields)
      return
    }

    let cents = Number(this.formatValue(total))
    const addedKeys: string[] = []
    for (const field of addedFields) {
      cents -= Number(field.formatValue(fields[field.fieldKey] ?? null))
      addedKeys.push(field.fieldKey)
    }
    if (cents < 0) {
      throw new RangeError(`valor ${String(total)} é menor que ${addedKeys.join(' e ')} somados`)
    }
    writeAtRange(line, this.range, String(cents).padStart(this.length, '0'))
  }

  private createAddedFields(): Array<CnabField<number>> {
    const fields: Array<CnabField<number>> = []
    for (const fieldClass of this.addedFields) {
      fields.push(new fieldClass(this.rawLine, this.lineNumber))
    }
    return fields
  }
}

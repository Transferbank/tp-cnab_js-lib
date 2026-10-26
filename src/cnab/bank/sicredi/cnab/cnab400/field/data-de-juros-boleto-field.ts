import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabFieldInvalidDateError } from '@cnab/type/cnab-validation-error'
import { parseDateAAAAMMDD } from '@cnab/utils/date-parser'
import { DataDeJurosBoletoField as Cnab400DataDeJurosBoletoField } from '@cnab/field/cnab400/data-de-juros-boleto-field'

export class DataDeJurosBoletoField extends Cnab400DataDeJurosBoletoField {
  static readonly bank = CnabBank.SICREDI
  static readonly format = CnabFormat.CNAB400
  readonly range: [number, number] = [21, 28]

  protected parseValue(rawValue: string): Date {
    const date = parseDateAAAAMMDD(rawValue)
    if (date == null) {
      throw new CnabFieldInvalidDateError(this.fieldKey, rawValue)
    }
    return date
  }
}

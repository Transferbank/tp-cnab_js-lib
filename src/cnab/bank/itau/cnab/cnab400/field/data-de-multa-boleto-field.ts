import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { parseDateDDMMAAAA } from '@cnab/utils/date-parser'
import { DataDeMultaBoletoField as Cnab400DataDeMultaBoletoField } from '@cnab/field/cnab400/data-de-multa-boleto-field'

export class DataDeMultaBoletoField extends Cnab400DataDeMultaBoletoField {
  static readonly bank = CnabBank.ITAU
  static readonly format = CnabFormat.CNAB400
  readonly range: [number, number] = [3, 10]
  protected readonly recordType: string = '2'

  protected parseDate(rawValue: string): Date | null {
    return parseDateDDMMAAAA(rawValue)
  }
}

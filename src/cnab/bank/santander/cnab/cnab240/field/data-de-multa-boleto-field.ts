import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { DataDeMultaBoletoField as Cnab240DataDeMultaBoletoField } from '@cnab/field/cnab240/data-de-multa-boleto-field'

export class DataDeMultaBoletoField extends Cnab240DataDeMultaBoletoField {
  static readonly bank = CnabBank.SANTANDER
  static readonly format = CnabFormat.CNAB240
}

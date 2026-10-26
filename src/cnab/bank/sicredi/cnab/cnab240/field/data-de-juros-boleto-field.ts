import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { DataDeJurosBoletoField as Cnab240DataDeJurosBoletoField } from '@cnab/field/cnab240/data-de-juros-boleto-field'

export class DataDeJurosBoletoField extends Cnab240DataDeJurosBoletoField {
  static readonly bank = CnabBank.SICREDI
  static readonly format = CnabFormat.CNAB240
}

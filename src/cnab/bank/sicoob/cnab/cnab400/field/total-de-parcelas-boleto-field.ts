import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { TotalDeParcelasBoletoField as Cnab400TotalDeParcelasBoletoField } from '@cnab/field/cnab400/total-de-parcelas-boleto-field'

export class TotalDeParcelasBoletoField extends Cnab400TotalDeParcelasBoletoField {
  static readonly bank = CnabBank.SICOOB
  static readonly format = CnabFormat.CNAB400
}

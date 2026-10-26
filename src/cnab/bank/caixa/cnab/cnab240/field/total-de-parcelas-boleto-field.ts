import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { TotalDeParcelasBoletoField as Cnab240TotalDeParcelasBoletoField } from '@cnab/field/cnab240/total-de-parcelas-boleto-field'

export class TotalDeParcelasBoletoField extends Cnab240TotalDeParcelasBoletoField {
  static readonly bank = CnabBank.CAIXA
  static readonly format = CnabFormat.CNAB240
  protected readonly seuNumeroRange: [number, number] = [63, 73]
}

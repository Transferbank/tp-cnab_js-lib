import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabDescontoRanges } from '@cnab/type/cnab-desconto'
import { DescontosBoletoField as Cnab240DescontosBoletoField } from '@cnab/field/cnab240/descontos-boleto-field'

export class DescontosBoletoField extends Cnab240DescontosBoletoField {
  static readonly bank = CnabBank.ITAU
  static readonly format = CnabFormat.CNAB240
  protected readonly descontos: CnabDescontoRanges[] = [
    { data: [143, 150], valor: [151, 165] }
  ]
}

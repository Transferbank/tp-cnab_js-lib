import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabDescontoRanges } from '@cnab/type/cnab-desconto'
import { DescontosAdicionaisBoletoField as Cnab400DescontosAdicionaisBoletoField } from '@cnab/field/cnab400/descontos-adicionais-boleto-field'

export class DescontosAdicionaisBoletoField extends Cnab400DescontosAdicionaisBoletoField {
  static readonly bank = CnabBank.BRADESCO
  static readonly format = CnabFormat.CNAB400
  protected readonly recordType: string = '2'
  protected readonly descontos: CnabDescontoRanges[] = [
    { data: [322, 327], valor: [328, 340] },
    { data: [341, 346], valor: [347, 359] }
  ]
}

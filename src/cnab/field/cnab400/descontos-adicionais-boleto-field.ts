import { CnabDescontoRanges } from '@cnab/type/cnab-desconto'
import { DescontosBoletoField } from '@cnab/field/cnab400/descontos-boleto-field'

export abstract class DescontosAdicionaisBoletoField extends DescontosBoletoField {
  protected abstract readonly descontos: CnabDescontoRanges[]
  protected abstract readonly recordType: string
}

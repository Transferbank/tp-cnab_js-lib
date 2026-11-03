import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabDescontoRanges } from '@cnab/type/cnab-desconto'
import { CnabTipoDeDesconto } from '@cnab/type/cnab-tipo-de-desconto'
import { DescontosBoletoField as Cnab400DescontosBoletoField } from '@cnab/field/cnab400/descontos-boleto-field'

export class DescontosBoletoField extends Cnab400DescontosBoletoField {
  static readonly bank = CnabBank.BRADESCO
  static readonly format = CnabFormat.CNAB400
  protected readonly descontos: CnabDescontoRanges[] = [
    { data: [174, 179], valor: [180, 192] },
    { valor: [83, 92] }
  ]

  protected resolveTipo(ranges: CnabDescontoRanges, codigo: string | null): CnabTipoDeDesconto | null {
    if (ranges.data == null) return CnabTipoDeDesconto.VALOR_POR_ANTECIPACAO
    return super.resolveTipo(ranges, codigo)
  }
}

import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabDescontoRanges } from '@cnab/type/cnab-desconto'
import { CnabTipoDeDesconto } from '@cnab/type/cnab-tipo-de-desconto'
import { DescontosBoletoField as Cnab400DescontosBoletoField } from '@cnab/field/cnab400/descontos-boleto-field'

export class DescontosBoletoField extends Cnab400DescontosBoletoField {
  static readonly bank = CnabBank.SICREDI
  static readonly format = CnabFormat.CNAB400
  protected readonly emptyDataMeansVencimento: boolean = true
  protected readonly descontos: CnabDescontoRanges[] = [
    { codigo: [18, 18], data: [174, 179], valor: [180, 192] },
    { valor: [83, 92] }
  ]

  protected isInformed(ranges: CnabDescontoRanges): boolean {
    if (ranges.data == null && this.extractInformed(this.descontos[0].valor) != null) return false
    return this.extractInformed(ranges.valor) != null
  }

  protected resolveTipo(ranges: CnabDescontoRanges, codigo: string | null): CnabTipoDeDesconto | null {
    if (ranges.data != null) return super.resolveTipo(ranges, codigo)
    const tipoDeDesconto = this.extractInformed([18, 18])
    if (tipoDeDesconto == 'A') return CnabTipoDeDesconto.VALOR_POR_ANTECIPACAO
    if (tipoDeDesconto == 'B') return CnabTipoDeDesconto.PERCENTUAL_POR_ANTECIPACAO
    return null
  }
}

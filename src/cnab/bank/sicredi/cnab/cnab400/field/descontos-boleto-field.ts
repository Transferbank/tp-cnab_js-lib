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
    { codigo: [18, 18], valor: [83, 92] }
  ]

  protected isInformed(ranges: CnabDescontoRanges): boolean {
    if (ranges.data == null && this.extractInformed(this.descontos[0].valor) != null) return false
    return super.isInformed(ranges)
  }

  protected resolveTipo(ranges: CnabDescontoRanges, codigo: string | null): CnabTipoDeDesconto | null {
    if (ranges.data != null) return super.resolveTipo(ranges, codigo)
    if (codigo == 'A') return CnabTipoDeDesconto.VALOR_POR_ANTECIPACAO
    if (codigo == 'B') return CnabTipoDeDesconto.PERCENTUAL_POR_ANTECIPACAO
    return null
  }
}

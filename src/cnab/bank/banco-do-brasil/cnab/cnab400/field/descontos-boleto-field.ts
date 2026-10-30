import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabDescontoRanges } from '@cnab/type/cnab-desconto'
import { CnabTipoDeDesconto } from '@cnab/type/cnab-tipo-de-desconto'
import { DescontosBoletoField as Cnab400DescontosBoletoField } from '@cnab/field/cnab400/descontos-boleto-field'

export class DescontosBoletoField extends Cnab400DescontosBoletoField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB400
  protected readonly recordType: string = '7'

  protected extractData(range?: [number, number]): Date | null {
    if (this.isDescontoPorDia(range)) return null
    return super.extractData(range)
  }

  protected resolveTipo(ranges: CnabDescontoRanges, codigo: string | null): CnabTipoDeDesconto | null {
    if (this.isDescontoPorDia(ranges.data)) return CnabTipoDeDesconto.VALOR_POR_ANTECIPACAO
    return super.resolveTipo(ranges, codigo)
  }

  private isDescontoPorDia(range?: [number, number]): boolean {
    return range != null && this.extractInformed(range) == '777777'
  }
}

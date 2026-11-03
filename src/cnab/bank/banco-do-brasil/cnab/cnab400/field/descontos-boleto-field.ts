import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabDescontoRanges } from '@cnab/type/cnab-desconto'
import { CnabTipoDeDesconto } from '@cnab/type/cnab-tipo-de-desconto'
import { DescontosBoletoField as Cnab400DescontosBoletoField } from '@cnab/field/cnab400/descontos-boleto-field'

export class DescontosBoletoField extends Cnab400DescontosBoletoField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB400
  protected readonly recordType: string = '7'
  protected readonly descontoComandos: string[] = ['01', '31', '33', '34']

  protected isInformed(ranges: CnabDescontoRanges): boolean {
    if (!this.holdsDesconto()) return false
    return super.isInformed(ranges)
  }

  protected extractData(range?: [number, number]): Date | null {
    if (this.isDescontoPerDay(range)) return null
    return super.extractData(range)
  }

  protected resolveTipo(ranges: CnabDescontoRanges, codigo: string | null): CnabTipoDeDesconto | null {
    if (this.isDescontoPerDay(ranges.data)) return CnabTipoDeDesconto.VALOR_POR_ANTECIPACAO
    return super.resolveTipo(ranges, codigo)
  }

  private isDescontoPerDay(range?: [number, number]): boolean {
    return range != null && this.extractInformed(range) == '777777'
  }

  private holdsDesconto(): boolean {
    const comando = this.extractRangeFromLine(108, 110)
    const isVendor = this.extractRangeFromLine(101, 106) == '08VDR'
    return this.descontoComandos.includes(comando) && !isVendor
  }
}

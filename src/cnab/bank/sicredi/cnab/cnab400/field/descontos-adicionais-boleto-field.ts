import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabDesconto, CnabDescontoRanges } from '@cnab/type/cnab-desconto'
import { CnabTipoDeDesconto } from '@cnab/type/cnab-tipo-de-desconto'
import { getTipoDeDesconto } from '@cnab/bank/cnab-tipo-de-desconto-tables'
import { DescontosAdicionaisBoletoField as Cnab400DescontosAdicionaisBoletoField } from '@cnab/field/cnab400/descontos-adicionais-boleto-field'

export class DescontosAdicionaisBoletoField extends Cnab400DescontosAdicionaisBoletoField {
  static readonly bank = CnabBank.SICREDI
  static readonly format = CnabFormat.CNAB400
  protected readonly recordType: string = '7'
  protected readonly descontos: CnabDescontoRanges[] = [
    { data: [55, 60], valor: [61, 73] },
    { data: [74, 79], valor: [80, 92] }
  ]

  handleDuplicatedValue(previousValue: unknown): CnabDesconto[] {
    const previous = previousValue as CnabDesconto[]
    const tipo = getTipoDeDesconto(CnabBank.SICREDI, CnabFormat.CNAB400, previous[0]?.codigo ?? null)
    return [...previous.filter(desconto => !this.isPerDay(desconto)), ...(this.value ?? []).map(desconto => ({ ...desconto, tipo }))]
  }

  private isPerDay(desconto: CnabDesconto): boolean {
    return desconto.tipo == CnabTipoDeDesconto.VALOR_POR_ANTECIPACAO || desconto.tipo == CnabTipoDeDesconto.PERCENTUAL_POR_ANTECIPACAO
  }
}

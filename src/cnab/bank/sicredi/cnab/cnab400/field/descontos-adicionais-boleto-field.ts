import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabDesconto, CnabDescontoRanges } from '@cnab/type/cnab-desconto'
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
    const tipo = previous[0]?.tipo ?? null
    return [...previous, ...(this.value ?? []).map(desconto => ({ ...desconto, tipo }))]
  }
}
